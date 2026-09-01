-- ============================================
-- 위드북 (WithBook) 데이터베이스 스키마
-- Supabase SQL Editor에서 이 전체를 복사해서 실행하세요
-- ============================================

-- 1) 사용자 프로필 테이블
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  avatar_url text default '',
  quote text default '',
  favorite_authors text[] default '{}',
  genres text[] default '{}',
  reading_badges text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) 인생책 (최대 3권, slot_order 0~2)
create table public.user_books (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  isbn text not null,
  title text not null,
  author text not null default '',
  cover_url text default '',
  slot_order integer not null default 0,
  created_at timestamptz default now(),
  unique(user_id, slot_order)
);

-- 3) 독서 기록 (게시물)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  book_isbn text not null,
  book_title text not null,
  book_author text not null default '',
  book_cover_url text default '',
  quote text not null default '',
  comment text default '',
  created_at timestamptz default now()
);

-- 4) 좋아요
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- 5) 만남 사전 신청
create table public.match_waitlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id)
);

-- ============================================
-- 보안 정책 (Row Level Security)
-- ============================================

alter table public.users enable row level security;
alter table public.user_books enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.match_waitlist enable row level security;

-- users: 누구나 읽기 / 본인만 쓰기·수정
create policy "users_select" on public.users for select using (true);
create policy "users_insert" on public.users for insert with check (auth.uid() = id);
create policy "users_update" on public.users for update using (auth.uid() = id);

-- user_books: 누구나 읽기 / 본인만 관리
create policy "user_books_select" on public.user_books for select using (true);
create policy "user_books_insert" on public.user_books for insert with check (auth.uid() = user_id);
create policy "user_books_update" on public.user_books for update using (auth.uid() = user_id);
create policy "user_books_delete" on public.user_books for delete using (auth.uid() = user_id);

-- posts: 누구나 읽기 / 본인만 관리
create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_update" on public.posts for update using (auth.uid() = user_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = user_id);

-- likes: 누구나 읽기 / 본인만 관리
create policy "likes_select" on public.likes for select using (true);
create policy "likes_insert" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on public.likes for delete using (auth.uid() = user_id);

-- match_waitlist: 로그인한 유저만 읽기·쓰기
create policy "waitlist_select" on public.match_waitlist for select using (auth.role() = 'authenticated');
create policy "waitlist_insert" on public.match_waitlist for insert with check (auth.uid() = user_id);

-- ============================================
-- 회원가입 시 자동으로 users 행 생성하는 트리거
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
