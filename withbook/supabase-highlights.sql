-- ============================================
-- 위드북 (WithBook) 밑줄 시스템 스키마
-- Supabase SQL Editor에서 이 전체를 복사해서 실행하세요
-- 기존 테이블(users, posts, likes 등)은 건드리지 않습니다
-- ============================================

-- 1) 밑줄 테이블
create table public.highlights (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  book_isbn text not null,
  book_title text not null,
  book_author text not null default '',
  book_cover_url text default '',
  sentence text not null,
  reason text not null default '',
  context text not null default '',
  created_at timestamptz default now()
);

-- 2) 밑줄 반응 테이블 (원탭 반응 3종)
--    felt_same    = "나도 그랬어요"
--    want_to_read = "이 책 읽어볼게요"
--    stays_long   = "오래 남네요"
create table public.highlight_reactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  highlight_id uuid references public.highlights(id) on delete cascade not null,
  reaction_type text not null check (reaction_type in ('felt_same', 'want_to_read', 'stays_long')),
  created_at timestamptz default now(),
  unique(user_id, highlight_id, reaction_type)
);

-- ============================================
-- 인덱스
-- ============================================

create index idx_highlights_user_id on public.highlights(user_id);
create index idx_highlights_created_at on public.highlights(created_at desc);
create index idx_highlight_reactions_highlight_id on public.highlight_reactions(highlight_id);
create index idx_highlight_reactions_user_id on public.highlight_reactions(user_id);

-- ============================================
-- 보안 정책 (Row Level Security)
-- ============================================

alter table public.highlights enable row level security;
alter table public.highlight_reactions enable row level security;

-- highlights: 누구나 읽기 / 본인만 쓰기·삭제
create policy "highlights_select" on public.highlights for select using (true);
create policy "highlights_insert" on public.highlights for insert with check (auth.uid() = user_id);
create policy "highlights_delete" on public.highlights for delete using (auth.uid() = user_id);

-- highlight_reactions: 누구나 읽기 / 본인만 쓰기·삭제
create policy "highlight_reactions_select" on public.highlight_reactions for select using (true);
create policy "highlight_reactions_insert" on public.highlight_reactions for insert with check (auth.uid() = user_id);
create policy "highlight_reactions_delete" on public.highlight_reactions for delete using (auth.uid() = user_id);
