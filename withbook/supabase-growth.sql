-- ============================================================
-- supabase-growth.sql
-- 전략 3장: 유저 성장 + 조개 지표 + 온보딩 질문
-- 실행 순서: supabase-schema → highlights → gates → schema-chat → dunbar → growth
-- ============================================================

-- 1. 온보딩 3질문 답변
create table if not exists onboarding_answers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  q1_answer int not null default 0,
  q2_answer int not null default 0,
  q3_answer int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table onboarding_answers enable row level security;

create policy "본인만 읽기" on onboarding_answers
  for select using (auth.uid() = user_id);

create policy "본인만 쓰기" on onboarding_answers
  for insert with check (auth.uid() = user_id);

create policy "본인만 수정" on onboarding_answers
  for update using (auth.uid() = user_id);

-- 2. 서재지기 초대
create table if not exists librarian_invitations (
  id uuid primary key default gen_random_uuid(),
  invitee_id uuid not null references auth.users(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  seojae_id uuid references seojae(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invitee_id, seojae_id)
);

alter table librarian_invitations enable row level security;

create policy "초대받은 사람 읽기" on librarian_invitations
  for select using (auth.uid() = invitee_id);

create policy "초대받은 사람 수정" on librarian_invitations
  for update using (auth.uid() = invitee_id);

create policy "서재지기만 생성" on librarian_invitations
  for insert with check (
    auth.uid() = inviter_id
    and exists (
      select 1 from user_gates
      where user_id = auth.uid()
      and gate_2_at is not null
    )
  );

create index if not exists idx_librarian_invitations_invitee
  on librarian_invitations(invitee_id, status);

-- 3. 이어읽기 (reading follows)
create table if not exists reading_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  highlight_id uuid not null references highlights(id) on delete cascade,
  highlight_owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, highlight_id)
);

alter table reading_follows enable row level security;

create policy "인증 사용자 읽기" on reading_follows
  for select using (auth.uid() is not null);

create policy "본인 데이터만 생성" on reading_follows
  for insert with check (auth.uid() = follower_id);

create index if not exists idx_reading_follows_follower
  on reading_follows(follower_id);

create index if not exists idx_reading_follows_owner
  on reading_follows(highlight_owner_id);

-- 4. 발제 크레딧
create table if not exists discussion_credits (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  question_text text not null,
  source text not null default 'seojae',
  used_seojae_id uuid references seojae(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table discussion_credits enable row level security;

create policy "인증 사용자 읽기" on discussion_credits
  for select using (auth.uid() is not null);

create policy "본인 데이터만 생성" on discussion_credits
  for insert with check (auth.uid() = author_id);

create index if not exists idx_discussion_credits_author
  on discussion_credits(author_id);

-- 5. 붙듦 (mentor links)
create table if not exists mentor_links (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references auth.users(id) on delete cascade,
  mentee_id uuid not null references auth.users(id) on delete cascade,
  mentee_gate1_at timestamptz,
  created_at timestamptz not null default now(),
  unique (mentor_id, mentee_id)
);

alter table mentor_links enable row level security;

create policy "인증 사용자 읽기" on mentor_links
  for select using (auth.uid() is not null);

create policy "본인 데이터만 생성" on mentor_links
  for insert with check (auth.uid() = mentor_id);

create index if not exists idx_mentor_links_mentor
  on mentor_links(mentor_id);

create index if not exists idx_mentor_links_mentee
  on mentor_links(mentee_id);

-- 6. 계절 배지
create table if not exists season_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seojae_id uuid not null references seojae(id) on delete cascade,
  season_label text not null,
  season_start date not null,
  season_end date not null,
  created_at timestamptz not null default now(),
  unique (user_id, seojae_id, season_label)
);

alter table season_completions enable row level security;

create policy "인증 사용자 읽기" on season_completions
  for select using (auth.uid() is not null);

create policy "본인 데이터만 생성" on season_completions
  for insert with check (auth.uid() = user_id);

create index if not exists idx_season_completions_user
  on season_completions(user_id);
