-- ============================================================
-- WithBook: 피드백 테이블
-- 실행 순서: 기존 스키마 이후 아무 때나 실행 가능
-- ============================================================

-- 피드백 테이블
create table if not exists public.feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  screen_name text not null,           -- 피드백을 남긴 화면 이름
  message text not null,               -- 피드백 내용
  user_agent text,                     -- 브라우저/기기 정보
  created_at timestamptz default now()
);

-- RLS 활성화
alter table public.feedback enable row level security;

-- 정책: 인증된 사용자만 삽입 가능
create policy "authenticated_insert_feedback"
  on public.feedback for insert
  to authenticated
  with check (true);

-- 정책: 본인 피드백만 조회 가능
create policy "own_feedback_select"
  on public.feedback for select
  to authenticated
  using (auth.uid() = user_id);

-- 인덱스
create index if not exists idx_feedback_created_at on public.feedback (created_at desc);
create index if not exists idx_feedback_user_id on public.feedback (user_id);
