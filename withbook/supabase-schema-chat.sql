-- ============================================================
-- Supabase Chat Schema (채팅방 · 멤버 · 메시지)
-- 실행: Supabase SQL Editor에서 이 파일 전체를 붙여넣고 실행
-- 여러 번 실행해도 안전합니다 (정책·인덱스·publication 모두 멱등).
-- ============================================================

-- ── 1. 테이블 ──

create table if not exists public.chat_rooms (
  id   text primary key,
  name text not null,
  type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_members (
  room_id    text not null references public.chat_rooms(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  room_id    text not null references public.chat_rooms(id) on delete cascade,
  sender_id  uuid references auth.users(id) on delete set null,
  type       text not null default 'message' check (type in ('message', 'system')),
  text       text not null,
  created_at timestamptz not null default now()
);

-- 방 종류: 앱은 club · event 외에 seojae · highlight_pair도 씁니다
-- (ChatList의 타입 유니온과 맞춥니다). 예전 check가 남아 있으면 넓혀 줍니다.
alter table public.chat_rooms drop constraint if exists chat_rooms_type_check;
alter table public.chat_rooms add constraint chat_rooms_type_check
  check (type in ('club', 'event', 'seojae', 'highlight_pair'));

-- ── 2. 멤버 판정 함수 ──
--
-- RLS 정책 안에서 chat_members를 직접 조회하면 그 테이블의 RLS가 다시 걸립니다.
-- chat_members 자신의 정책에서는 무한 재귀가 되고, 다른 테이블에서도 0건이 되기 쉽습니다.
-- 회비 정책(supabase-fee-accounts.sql)과 같은 방식으로 security definer 함수로 분리합니다.

create or replace function public.is_chat_member(p_room_id text, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.chat_members
    where room_id = p_room_id
      and user_id = p_user_id
  );
$$;

revoke all on function public.is_chat_member(text, uuid) from public, anon;
grant execute on function public.is_chat_member(text, uuid) to authenticated;

-- ── 3. RLS ──

alter table public.chat_rooms    enable row level security;
alter table public.chat_members  enable row level security;
alter table public.chat_messages enable row level security;

-- 예전 정책 정리 (이름이 바뀐 것 포함)
drop policy if exists "Members can read rooms"               on public.chat_rooms;
drop policy if exists "Authenticated users can create rooms" on public.chat_rooms;
drop policy if exists "Members can read members"             on public.chat_members;
drop policy if exists "Users can join rooms"                 on public.chat_members;
drop policy if exists "Users can leave rooms"                on public.chat_members;
drop policy if exists "Members can read messages"            on public.chat_messages;
drop policy if exists "Members can send messages"            on public.chat_messages;
drop policy if exists chat_rooms_select    on public.chat_rooms;
drop policy if exists chat_rooms_insert    on public.chat_rooms;
drop policy if exists chat_members_select  on public.chat_members;
drop policy if exists chat_members_insert  on public.chat_members;
drop policy if exists chat_members_delete  on public.chat_members;
drop policy if exists chat_messages_select on public.chat_messages;
drop policy if exists chat_messages_insert on public.chat_messages;
drop policy if exists chat_messages_delete on public.chat_messages;

-- chat_rooms: 그 방의 멤버만 조회
create policy chat_rooms_select on public.chat_rooms
  for select to authenticated
  using (public.is_chat_member(id, auth.uid()));

-- chat_rooms: 생성은 인증 사용자 (모임·서재를 열 때 방이 함께 만들어집니다)
-- 참고: 방 id를 아는 사람이 선점할 수는 있지만, 멤버가 아니면 읽지도 쓰지도 못합니다.
-- update·delete 정책은 두지 않아 남의 방 이름을 바꾸거나 지울 수 없습니다.
create policy chat_rooms_insert on public.chat_rooms
  for insert to authenticated
  with check (auth.uid() is not null);

-- chat_members: 같은 방 멤버만 조회
create policy chat_members_select on public.chat_members
  for select to authenticated
  using (public.is_chat_member(room_id, auth.uid()));

-- chat_members: 본인만 추가 (남을 방에 밀어 넣을 수 없습니다)
create policy chat_members_insert on public.chat_members
  for insert to authenticated
  with check (user_id = auth.uid());

-- chat_members: 본인만 탈퇴
create policy chat_members_delete on public.chat_members
  for delete to authenticated
  using (user_id = auth.uid());

-- chat_messages: 그 방의 멤버만 읽기
create policy chat_messages_select on public.chat_messages
  for select to authenticated
  using (public.is_chat_member(room_id, auth.uid()));

-- chat_messages: 본인 명의로, 본인이 속한 방에만 쓰기
-- (입·퇴장 시스템 메시지도 본인 sender_id로 남기므로 같은 조건을 통과합니다)
create policy chat_messages_insert on public.chat_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_chat_member(room_id, auth.uid())
  );

-- chat_messages: 본인 메시지만 삭제
create policy chat_messages_delete on public.chat_messages
  for delete to authenticated
  using (sender_id = auth.uid());

-- ── 4. Realtime ──
-- 이미 추가돼 있으면 add table이 에러가 나므로 확인 후 추가합니다.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end
$$;

-- ── 5. 인덱스 ──

create index if not exists idx_chat_messages_room_created
  on public.chat_messages (room_id, created_at);

create index if not exists idx_chat_members_room
  on public.chat_members (room_id);

create index if not exists idx_chat_members_user
  on public.chat_members (user_id);
