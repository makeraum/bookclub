-- ============================================
-- 위드북 30초 회고 관련 테이블
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1) 모임 회고 응답
create table public.meeting_retrospectives (
  id uuid default gen_random_uuid() primary key,
  event_id text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  book_rating text not null check (book_rating in ('good', 'okay', 'disappointing')),
  opinion_divergence text not null check (opinion_divergence in ('a_lot', 'some', 'similar')),
  return_intent text not null check (return_intent in ('yes', 'undecided', 'no')),
  free_text text default '',
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

alter table public.meeting_retrospectives enable row level security;

-- 본인만 읽기/쓰기
create policy "Users can read own retrospectives"
  on public.meeting_retrospectives for select
  using (auth.uid() = user_id);

create policy "Users can insert own retrospectives"
  on public.meeting_retrospectives for insert
  with check (auth.uid() = user_id);

-- 서재지기는 자기 이벤트의 회고 조회 가능
-- (event_id와 서재 연결은 애플리케이션 레벨에서 검증)
create policy "Librarians can read event retrospectives"
  on public.meeting_retrospectives for select
  using (true);

-- 2) 남은 문장 카드
create table public.remaining_sentence_cards (
  id uuid default gen_random_uuid() primary key,
  event_id text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  book_isbn text not null,
  sentences jsonb default '[]',
  participants text[] default '{}',
  saved_to_library boolean default false,
  shared_to_feed boolean default false,
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

alter table public.remaining_sentence_cards enable row level security;

create policy "Users can read own cards"
  on public.remaining_sentence_cards for select
  using (auth.uid() = user_id);

create policy "Users can insert own cards"
  on public.remaining_sentence_cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cards"
  on public.remaining_sentence_cards for update
  using (auth.uid() = user_id);

-- 3) 알림 수신 동의
create table public.notification_optins (
  user_id uuid references auth.users(id) on delete cascade primary key,
  email_optin boolean default false,
  updated_at timestamptz default now()
);

alter table public.notification_optins enable row level security;

create policy "Users can read own optin"
  on public.notification_optins for select
  using (auth.uid() = user_id);

create policy "Users can upsert own optin"
  on public.notification_optins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own optin"
  on public.notification_optins for update
  using (auth.uid() = user_id);
