-- ============================================================
-- 서재지기 콘솔 테이블 (supabase-console.sql)
-- 실행 순서: 이 파일 전체를 Supabase SQL Editor에 붙여넣고 실행
-- 선행 조건: auth.users 테이블이 존재해야 합니다
-- ============================================================

-- 1) attendances — 모임별 출석 기록
create table if not exists public.attendances (
  id uuid default gen_random_uuid() primary key,
  seojae_id text not null,
  meeting_date date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  attended boolean not null default false,
  marked_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (seojae_id, meeting_date, user_id)
);

alter table public.attendances enable row level security;

-- 서재지기(marked_by)만 자기 서재의 출석을 읽고 쓸 수 있음
create policy "attendances_select" on public.attendances
  for select using (marked_by = auth.uid());

create policy "attendances_insert" on public.attendances
  for insert with check (marked_by = auth.uid());

create policy "attendances_update" on public.attendances
  for update using (marked_by = auth.uid());


-- 2) co_attendances — 함께 모임 횟수 (출석 체크 시 자동 증가)
create table if not exists public.co_attendances (
  id uuid default gen_random_uuid() primary key,
  seojae_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  count int not null default 0,
  updated_at timestamptz default now(),
  unique (seojae_id, user_id)
);

alter table public.co_attendances enable row level security;

-- 서재지기만 자기 서재의 co_attendances를 관리
create policy "co_attendances_select" on public.co_attendances
  for select using (
    exists (
      select 1 from public.attendances a
      where a.seojae_id = co_attendances.seojae_id
        and a.marked_by = auth.uid()
    )
  );

create policy "co_attendances_upsert" on public.co_attendances
  for insert with check (
    exists (
      select 1 from public.attendances a
      where a.seojae_id = co_attendances.seojae_id
        and a.marked_by = auth.uid()
    )
  );

create policy "co_attendances_update" on public.co_attendances
  for update using (
    exists (
      select 1 from public.attendances a
      where a.seojae_id = co_attendances.seojae_id
        and a.marked_by = auth.uid()
    )
  );


-- 3) session_notes — 모임 메모 (서재지기 전용)
create table if not exists public.session_notes (
  id uuid default gen_random_uuid() primary key,
  seojae_id text not null,
  meeting_date date not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (seojae_id, meeting_date, author_id)
);

alter table public.session_notes enable row level security;

create policy "session_notes_select" on public.session_notes
  for select using (author_id = auth.uid());

create policy "session_notes_insert" on public.session_notes
  for insert with check (author_id = auth.uid());

create policy "session_notes_update" on public.session_notes
  for update using (author_id = auth.uid());


-- 4) discussion_questions — 발제 질문 (자동 생성 + 편집 가능)
create table if not exists public.discussion_questions (
  id uuid default gen_random_uuid() primary key,
  seojae_id text not null,
  meeting_date date not null,
  question_order int not null default 0,
  question_text text not null,
  is_used boolean not null default false,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.discussion_questions enable row level security;

create policy "discussion_questions_select" on public.discussion_questions
  for select using (created_by = auth.uid());

create policy "discussion_questions_insert" on public.discussion_questions
  for insert with check (created_by = auth.uid());

create policy "discussion_questions_update" on public.discussion_questions
  for update using (created_by = auth.uid());

create policy "discussion_questions_delete" on public.discussion_questions
  for delete using (created_by = auth.uid());
