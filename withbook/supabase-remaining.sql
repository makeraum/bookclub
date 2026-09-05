-- ============================================================
-- 위드북 — 아직 실행하지 않은 SQL 모음
-- 2026-09-04 기준, 실제 Supabase 인스턴스를 조회해 남은 것만 순서대로 합쳤습니다.
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → 이 파일 전체를 붙여넣고 Run
--
-- 이 파일은 여러 번 실행해도 안전합니다.
--   · create table if not exists
--   · drop policy if exists → create policy
--   · create index if not exists
--   · create or replace function
--
-- 이미 적용된 것 (다시 실행할 필요 없음)
--   supabase-schema.sql · supabase-highlights.sql · supabase-gates.sql
--   supabase-growth.sql · supabase-dunbar.sql · supabase-console.sql
--   supabase-promises.sql · supabase-feedback.sql
--
-- 이 파일에 담긴 것 (실행 순서대로)
--   1. supabase-sentiment.sql      — highlight_sentiments
--   2. supabase-retrospective.sql  — meeting_retrospectives / remaining_sentence_cards / notification_optins
--   3. supabase-coattendance.sql   — co_attendances 읽기 정책 (적용 여부를 알 수 없어 안전하게 재적용)
--   4. supabase-privacy.sql        — user_consents / seojae.owner_id 완화 / delete_my_account()
--   5. supabase-fees.sql           — fees / fee_payments / expenses / fee_reminders
--   6. (선택) chat_members RLS 무한 재귀 수정 — 지금 채팅 조회가 깨져 있습니다
-- ============================================================


-- ============================================================
-- 1. 밑줄 감성 분류 (supabase-sentiment.sql)
-- ============================================================
-- 사용자에게 sentiment 값은 직접 노출하지 않습니다 (내부 매칭용).

create table if not exists public.highlight_sentiments (
  highlight_id uuid primary key references public.highlights(id) on delete cascade,
  sentiment    text not null check (sentiment in ('positive', 'reserved', 'contrary')),
  analyzed_at  timestamptz default now()
);

alter table public.highlight_sentiments enable row level security;

-- 읽기는 누구나 (매칭 로직에서 사용)
drop policy if exists "Anyone can read sentiments" on public.highlight_sentiments;
create policy "Anyone can read sentiments" on public.highlight_sentiments
  for select using (true);

-- 쓰기 정책 없음 = 서버 사이드(service_role)에서만 기록.
-- 사용자가 자기 밑줄의 분류를 바꿀 수 없게 하려는 의도입니다.


-- ============================================================
-- 2. 30초 회고 (supabase-retrospective.sql)
-- ============================================================

-- 2-1) 모임 회고 응답
create table if not exists public.meeting_retrospectives (
  id                 uuid default gen_random_uuid() primary key,
  event_id           text not null,
  user_id            uuid not null references auth.users(id) on delete cascade,
  book_rating        text not null check (book_rating in ('good', 'okay', 'disappointing')),
  opinion_divergence text not null check (opinion_divergence in ('a_lot', 'some', 'similar')),
  return_intent      text not null check (return_intent in ('yes', 'undecided', 'no')),
  free_text          text default '',
  created_at         timestamptz default now(),
  unique (event_id, user_id)
);

alter table public.meeting_retrospectives enable row level security;

drop policy if exists "Users can read own retrospectives" on public.meeting_retrospectives;
create policy "Users can read own retrospectives" on public.meeting_retrospectives
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own retrospectives" on public.meeting_retrospectives;
create policy "Users can insert own retrospectives" on public.meeting_retrospectives
  for insert with check (auth.uid() = user_id);

-- 서재지기가 자기 모임의 회고를 보려면 필요합니다.
-- event_id와 서재의 연결은 애플리케이션에서 검증합니다.
drop policy if exists "Librarians can read event retrospectives" on public.meeting_retrospectives;
create policy "Librarians can read event retrospectives" on public.meeting_retrospectives
  for select using (true);

-- 2-2) 남은 문장 카드
create table if not exists public.remaining_sentence_cards (
  id               uuid default gen_random_uuid() primary key,
  event_id         text not null,
  user_id          uuid not null references auth.users(id) on delete cascade,
  book_isbn        text not null,
  sentences        jsonb default '[]',
  participants     text[] default '{}',
  saved_to_library boolean default false,
  shared_to_feed   boolean default false,
  created_at       timestamptz default now(),
  unique (event_id, user_id)
);

alter table public.remaining_sentence_cards enable row level security;

drop policy if exists "Users can read own cards" on public.remaining_sentence_cards;
create policy "Users can read own cards" on public.remaining_sentence_cards
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own cards" on public.remaining_sentence_cards;
create policy "Users can insert own cards" on public.remaining_sentence_cards
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own cards" on public.remaining_sentence_cards;
create policy "Users can update own cards" on public.remaining_sentence_cards
  for update using (auth.uid() = user_id);

-- 2-3) 알림 수신 동의
create table if not exists public.notification_optins (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  email_optin  boolean default false,
  updated_at   timestamptz default now()
);

alter table public.notification_optins enable row level security;

drop policy if exists "Users can read own optin" on public.notification_optins;
create policy "Users can read own optin" on public.notification_optins
  for select using (auth.uid() = user_id);

drop policy if exists "Users can upsert own optin" on public.notification_optins;
create policy "Users can upsert own optin" on public.notification_optins
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own optin" on public.notification_optins;
create policy "Users can update own optin" on public.notification_optins
  for update using (auth.uid() = user_id);


-- ============================================================
-- 3. 동석 기록 읽기 정책 (supabase-coattendance.sql)
-- ============================================================
-- 이 파일은 테이블을 만들지 않고 정책만 추가해서, 적용 여부를 밖에서 알 수 없습니다.
-- drop policy if exists를 앞에 두어 이미 적용됐더라도 안전하게 다시 적용합니다.

alter table public.co_attendances enable row level security;

drop policy if exists "Users can read own co-attendance records" on public.co_attendances;
create policy "Users can read own co-attendance records" on public.co_attendances
  for select using (user_id = auth.uid());


-- ============================================================
-- 4. 개인정보 동의 · 탈퇴 (supabase-privacy.sql)
-- ============================================================

-- ============================================================
-- A. 동의 이력 테이블
-- ============================================================
-- append-only 로그입니다. 동의도 철회도 새 행으로 쌓이며, 기존 행은 수정하지 않습니다.
-- 항목별 "현재 상태"는 agreed_at이 가장 최근인 행으로 판단합니다.
-- 이렇게 두면 "언제 무엇에 동의했고 언제 철회했는지"를 그대로 증명할 수 있습니다.

create table if not exists public.user_consents (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  consent_type  text not null check (consent_type in (
                  'age14', 'terms', 'privacy', 'overseas', 'sensitive', 'marketing_email'
                )),
  agreed        boolean not null,
  policy_version text not null,
  agreed_at     timestamptz not null default now(),
  -- 클라이언트가 /api/client-ip에서 받아 전달합니다.
  -- Vercel의 x-forwarded-for 기준이며, 프록시 환경에서는 정확하지 않을 수 있습니다.
  ip_address    text
);

create index if not exists idx_user_consents_user
  on public.user_consents (user_id, consent_type, agreed_at desc);

alter table public.user_consents enable row level security;

-- 본인 기록만 조회
drop policy if exists "user_consents_select" on public.user_consents;
create policy "user_consents_select" on public.user_consents
  for select using (auth.uid() = user_id);

-- 본인 기록만 추가
drop policy if exists "user_consents_insert" on public.user_consents;
create policy "user_consents_insert" on public.user_consents
  for insert with check (auth.uid() = user_id);

-- 수정·삭제 정책 없음 = 이력을 고칠 수 없음 (의도된 설계)


-- ============================================================
-- B. 탈퇴 시 서재가 통째로 사라지지 않도록 owner_id 제약 완화
-- ============================================================
-- 서재지기가 탈퇴해도 다른 멤버들의 기록은 남아야 합니다.
-- owner_id를 null 허용으로 바꾸고, 탈퇴 시 주인 자리를 비운 뒤 서재를 비활성화합니다.

do $$
begin
  if to_regclass('public.seojae') is not null then
    alter table public.seojae alter column owner_id drop not null;

    -- 기존 FK를 on delete set null로 교체
    if exists (
      select 1 from information_schema.table_constraints
      where constraint_name = 'seojae_owner_id_fkey' and table_name = 'seojae'
    ) then
      alter table public.seojae drop constraint seojae_owner_id_fkey;
    end if;

    alter table public.seojae
      add constraint seojae_owner_id_fkey
      foreign key (owner_id) references auth.users(id) on delete set null;
  end if;
end $$;


-- ============================================================
-- C. 회원 탈퇴 — 본인 계정과 기록을 실제로 삭제
-- ============================================================
-- security definer로 auth.users까지 지웁니다. auth.users를 지우면
-- on delete cascade가 걸린 테이블은 자동으로 정리되지만, 순서를 명시해
-- "무엇이 지워지는지"가 코드에 드러나게 했습니다.
--
-- to_regclass 검사를 두어, 아직 실행하지 않은 스키마 파일이 있어도 오류 없이 넘어갑니다.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception '로그인이 필요합니다';
  end if;

  -- 1) 밑줄과 그 반응
  if to_regclass('public.highlight_reactions') is not null then
    delete from public.highlight_reactions where user_id = uid;
  end if;
  if to_regclass('public.reading_follows') is not null then
    delete from public.reading_follows where follower_id = uid or highlight_owner_id = uid;
  end if;
  if to_regclass('public.pair_daily_reactions') is not null then
    -- 이 테이블의 소유자 컬럼은 user_id가 아니라 reactor_id입니다 (supabase-dunbar.sql 참고).
    -- 잘못된 컬럼명 때문에 delete_my_account() 전체가 여기서 중단되어 탈퇴가 되지 않았습니다.
    delete from public.pair_daily_reactions where reactor_id = uid;
  end if;
  -- highlight_sentiments는 highlights를 참조하며 cascade로 함께 지워집니다
  if to_regclass('public.highlights') is not null then
    delete from public.highlights where user_id = uid;
  end if;

  -- 2) 회고와 남은 문장 카드
  if to_regclass('public.meeting_retrospectives') is not null then
    delete from public.meeting_retrospectives where user_id = uid;
  end if;
  if to_regclass('public.remaining_sentence_cards') is not null then
    delete from public.remaining_sentence_cards where user_id = uid;
  end if;
  if to_regclass('public.notification_optins') is not null then
    delete from public.notification_optins where user_id = uid;
  end if;

  -- 3) 동석·출석 기록
  if to_regclass('public.co_attendances') is not null then
    delete from public.co_attendances where user_id = uid;
  end if;
  if to_regclass('public.attendances') is not null then
    delete from public.attendances where user_id = uid;
  end if;
  if to_regclass('public.session_notes') is not null then
    delete from public.session_notes where author_id = uid;
  end if;

  -- 4) 서재·모임 참여
  if to_regclass('public.seojae_members') is not null then
    delete from public.seojae_members where user_id = uid;
  end if;
  if to_regclass('public.city_community_members') is not null then
    delete from public.city_community_members where user_id = uid;
  end if;
  if to_regclass('public.highlight_pairs') is not null then
    delete from public.highlight_pairs where user_a = uid or user_b = uid;
  end if;

  -- 5) 성장·초대 기록
  if to_regclass('public.librarian_invitations') is not null then
    delete from public.librarian_invitations where invitee_id = uid or inviter_id = uid;
  end if;
  if to_regclass('public.mentor_links') is not null then
    delete from public.mentor_links where mentor_id = uid or mentee_id = uid;
  end if;
  if to_regclass('public.discussion_credits') is not null then
    delete from public.discussion_credits where author_id = uid;
  end if;
  if to_regclass('public.season_completions') is not null then
    delete from public.season_completions where user_id = uid;
  end if;
  if to_regclass('public.onboarding_answers') is not null then
    delete from public.onboarding_answers where user_id = uid;
  end if;
  if to_regclass('public.user_gates') is not null then
    delete from public.user_gates where user_id = uid;
  end if;

  -- 6) 내가 운영하던 서재는 주인 자리를 비우고 비활성화 (다른 멤버 기록 보존)
  if to_regclass('public.seojae') is not null then
    update public.seojae set owner_id = null, is_active = false where owner_id = uid;
  end if;

  -- 7) 회비·회계 (supabase-fees.sql)
  if to_regclass('public.fee_payments') is not null then
    delete from public.fee_payments where user_id = uid;
  end if;
  if to_regclass('public.fee_reminders') is not null then
    delete from public.fee_reminders where sent_by = uid;
  end if;
  if to_regclass('public.expenses') is not null then
    -- 지출 기록은 모임 정산을 위해 남기고 작성자 연결만 끊습니다
    update public.expenses set created_by = null where created_by = uid;
  end if;

  -- 8) 피드백은 익명화해서 남김 (서비스 개선 목적, 개인 식별 불가)
  if to_regclass('public.feedback') is not null then
    update public.feedback set user_id = null where user_id = uid;
  end if;

  -- 9) 프로필과 게시물
  if to_regclass('public.likes') is not null then
    delete from public.likes where user_id = uid;
  end if;
  if to_regclass('public.posts') is not null then
    delete from public.posts where user_id = uid;
  end if;
  if to_regclass('public.user_books') is not null then
    delete from public.user_books where user_id = uid;
  end if;
  if to_regclass('public.match_waitlist') is not null then
    delete from public.match_waitlist where user_id = uid;
  end if;
  if to_regclass('public.users') is not null then
    delete from public.users where id = uid;
  end if;

  -- 10) 동의 이력과 계정
  delete from public.user_consents where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;


-- ============================================================
-- 확인용 쿼리 (실행 후 붙여넣어 점검)
-- ============================================================
-- select consent_type, agreed, policy_version, agreed_at
--   from public.user_consents
--  where user_id = auth.uid()
--  order by agreed_at desc;


-- ============================================================
-- 5. 회비 · 회계 (supabase-fees.sql)
-- ============================================================

-- ============================================================
-- 1) 모임별 회비 설정
-- ============================================================
create table if not exists public.fees (
  event_id         text primary key,
  host_id          uuid not null references auth.users(id) on delete cascade,
  amount           integer not null check (amount >= 0),
  includes         text[] not null default '{}',
  due_date         date,
  bank_name        text default '',
  bank_account     text default '',
  account_holder   text default '',
  target_amount    integer not null default 0,
  -- 정산 요약(수입·지출·잔액)을 참가자에게 공개할지
  settlement_public boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.fees enable row level security;

-- 회비 정보는 누구나 조회 (모임 상세에서 표시)
drop policy if exists "fees_select" on public.fees;
create policy "fees_select" on public.fees
  for select using (true);

-- 설정·수정은 서재지기 본인만
drop policy if exists "fees_insert" on public.fees;
create policy "fees_insert" on public.fees
  for insert with check (auth.uid() = host_id);

drop policy if exists "fees_update" on public.fees;
create policy "fees_update" on public.fees
  for update using (auth.uid() = host_id);

drop policy if exists "fees_delete" on public.fees;
create policy "fees_delete" on public.fees
  for delete using (auth.uid() = host_id);


-- ============================================================
-- 2) 참가자별 납부 기록
-- ============================================================
-- status: unpaid(미납) → pending(확인 중) → paid(납부 완료)
--   unpaid  : 아직 아무 행동 없음
--   pending : 참가자가 "이체 완료했어요"를 눌렀고 서재지기 확인 대기
--   paid    : 서재지기가 입금을 확인했거나, PG 결제가 승인됨

create table if not exists public.fee_payments (
  id           uuid primary key default gen_random_uuid(),
  event_id     text not null,
  user_id      uuid not null references auth.users(id) on delete cascade,
  amount       integer not null check (amount >= 0),
  status       text not null default 'unpaid'
                 check (status in ('unpaid', 'pending', 'paid')),
  method       text check (method in ('transfer', 'card', 'kakaopay')),
  -- 참가자가 이체 완료를 알린 시각
  reported_at  timestamptz,
  -- 납부가 확정된 시각
  paid_at      timestamptz,
  confirmed_by uuid references auth.users(id) on delete set null,
  confirmed_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists idx_fee_payments_event on public.fee_payments (event_id, status);
create index if not exists idx_fee_payments_user on public.fee_payments (user_id);

alter table public.fee_payments enable row level security;

-- 조회: 참가자는 자기 기록만, 서재지기는 자기 모임 전체
drop policy if exists "fee_payments_select" on public.fee_payments;
create policy "fee_payments_select" on public.fee_payments
  for select using (
    auth.uid() = user_id
    or auth.uid() = (select host_id from public.fees f where f.event_id = fee_payments.event_id)
  );

-- 추가: 본인 기록만
drop policy if exists "fee_payments_insert" on public.fee_payments;
create policy "fee_payments_insert" on public.fee_payments
  for insert with check (auth.uid() = user_id);

-- 수정: 본인(이체 완료 알림) 또는 서재지기(입금 확인)
drop policy if exists "fee_payments_update" on public.fee_payments;
create policy "fee_payments_update" on public.fee_payments
  for update using (
    auth.uid() = user_id
    or auth.uid() = (select host_id from public.fees f where f.event_id = fee_payments.event_id)
  );

-- 삭제: 서재지기만
drop policy if exists "fee_payments_delete" on public.fee_payments;
create policy "fee_payments_delete" on public.fee_payments
  for delete using (
    auth.uid() = (select host_id from public.fees f where f.event_id = fee_payments.event_id)
  );


-- ============================================================
-- 3) 모임 지출
-- ============================================================
create table if not exists public.expenses (
  id         uuid primary key default gen_random_uuid(),
  event_id   text not null,
  title      text not null,
  amount     integer not null check (amount >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_event on public.expenses (event_id);

alter table public.expenses enable row level security;

-- 조회: 서재지기는 항상, 참가자는 정산 공개가 켜졌을 때만
drop policy if exists "expenses_select" on public.expenses;
create policy "expenses_select" on public.expenses
  for select using (
    auth.uid() = (select host_id from public.fees f where f.event_id = expenses.event_id)
    or (select settlement_public from public.fees f where f.event_id = expenses.event_id)
  );

-- 추가·수정·삭제: 서재지기만
drop policy if exists "expenses_insert" on public.expenses;
create policy "expenses_insert" on public.expenses
  for insert with check (
    auth.uid() = (select host_id from public.fees f where f.event_id = expenses.event_id)
  );

drop policy if exists "expenses_update" on public.expenses;
create policy "expenses_update" on public.expenses
  for update using (
    auth.uid() = (select host_id from public.fees f where f.event_id = expenses.event_id)
  );

drop policy if exists "expenses_delete" on public.expenses;
create policy "expenses_delete" on public.expenses
  for delete using (
    auth.uid() = (select host_id from public.fees f where f.event_id = expenses.event_id)
  );


-- ============================================================
-- 4) 미납 리마인드 발송 내역
-- ============================================================
-- "언제 누구에게 무슨 문구로 보냈는지"를 남겨, 중복 발송과 과한 독촉을 막습니다.

create table if not exists public.fee_reminders (
  id             uuid primary key default gen_random_uuid(),
  event_id       text not null,
  sent_by        uuid not null references auth.users(id) on delete cascade,
  recipient_ids  uuid[] not null default '{}',
  message        text not null default '',
  sent_at        timestamptz not null default now()
);

create index if not exists idx_fee_reminders_event on public.fee_reminders (event_id, sent_at desc);

alter table public.fee_reminders enable row level security;

-- 조회·발송: 서재지기 본인만 (받은 사람에게는 별도 알림으로 전달)
drop policy if exists "fee_reminders_select" on public.fee_reminders;
create policy "fee_reminders_select" on public.fee_reminders
  for select using (auth.uid() = sent_by);

drop policy if exists "fee_reminders_insert" on public.fee_reminders;
create policy "fee_reminders_insert" on public.fee_reminders
  for insert with check (auth.uid() = sent_by);


-- ============================================================
-- 5) 탈퇴 시 정리
-- ============================================================
-- 회비 관련 삭제는 supabase-privacy.sql의 delete_my_account()가 처리합니다.
-- (to_regclass 검사가 들어 있어 이 파일을 실행하지 않아도 오류가 나지 않습니다)
--   · fee_payments  — 본인 납부 기록 삭제
--   · fee_reminders — 본인이 보낸 리마인드 내역 삭제
--   · expenses      — 본인이 기록한 지출은 작성자 연결만 끊고 남김 (모임 정산 보존)
--   · fees          — host_id cascade로 함께 삭제


-- ============================================================
-- 확인용 쿼리
-- ============================================================
-- select status, count(*), sum(amount)
--   from public.fee_payments where event_id = 'ev1' group by status;


-- ============================================================
-- 6. (선택) chat_members RLS 무한 재귀 수정
-- ============================================================
-- 현재 chat_rooms / chat_members 조회가 서버에서 500으로 실패합니다.
--   code 42P17 — infinite recursion detected in policy for relation "chat_members"
-- chat_members의 SELECT 정책이 chat_members 자신을 조회하기 때문입니다.
--
-- security definer 함수로 멤버 여부를 확인하면 재귀가 끊깁니다.
-- (함수 본문은 RLS를 거치지 않으므로 정책이 다시 호출되지 않습니다)
--
-- ⚠️ 채팅 테이블은 이 저장소의 12개 파일이 아니라 supabase-schema-chat.sql에서 만들어졌습니다.
--    채팅을 쓰지 않는다면 이 절은 건너뛰어도 됩니다.

do $$
begin
  if to_regclass('public.chat_members') is null then
    raise notice 'chat_members 테이블이 없어 6번 절을 건너뜁니다';
    return;
  end if;

  execute $ddl$
    create or replace function public.is_chat_member(p_room_id text)
    returns boolean
    language sql
    security definer
    stable
    set search_path = public
    as $fn$
      select exists (
        select 1 from public.chat_members
        where room_id = p_room_id and user_id = auth.uid()
      );
    $fn$
  $ddl$;

  execute 'revoke all on function public.is_chat_member(text) from public';
  execute 'grant execute on function public.is_chat_member(text) to authenticated';

  execute 'drop policy if exists "Members can read members" on public.chat_members';
  execute 'create policy "Members can read members" on public.chat_members
             for select using (public.is_chat_member(room_id))';

  execute 'drop policy if exists "Members can read rooms" on public.chat_rooms';
  execute 'create policy "Members can read rooms" on public.chat_rooms
             for select using (public.is_chat_member(id))';
end $$;


-- ============================================================
-- 실행 후 확인
-- ============================================================
-- 아래 쿼리로 이 파일이 만든 테이블이 모두 생겼는지 봅니다. 8행이 나와야 합니다.
--
-- select table_name from information_schema.tables
--  where table_schema = 'public'
--    and table_name in (
--      'highlight_sentiments', 'meeting_retrospectives', 'remaining_sentence_cards',
--      'notification_optins', 'user_consents', 'fees', 'fee_payments', 'expenses'
--    )
--  order by table_name;
