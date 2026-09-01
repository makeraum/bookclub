-- ============================================
-- 위드북 (WithBook) 이중 게이트 스키마
-- Supabase SQL Editor에서 이 전체를 복사해서 실행하세요
-- 사전 조건: supabase-highlights.sql이 먼저 실행되어 있어야 합니다
-- ============================================

-- 1) 게이트 통과 기록 테이블
create table public.user_gates (
  user_id uuid references public.users(id) on delete cascade primary key,
  gate_0_at timestamptz,  -- 가입 게이트: 1권 + 밑줄 1개 + 이유 완료
  gate_1_at timestamptz,  -- 기록자 게이트: 밑줄 30개 (3권 이상)
  gate_2_at timestamptz,  -- 라운지 게이트: 서재 4주 참여 + 결제 이력
  created_at timestamptz default now()
);

-- 2) 유저별 밑줄 통계 뷰 (Gate 1 판정용)
create or replace view public.user_highlight_stats as
select
  user_id,
  count(*)::int as total_count,
  count(distinct book_isbn)::int as book_count
from public.highlights
group by user_id;

-- 3) 회원가입 시 자동으로 user_gates 행 생성하는 트리거
--    (기존 handle_new_user 트리거에 추가하는 대신 별도 트리거로 분리)
create or replace function public.handle_new_user_gates()
returns trigger as $$
begin
  insert into public.user_gates (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_gates
  after insert on auth.users
  for each row execute function public.handle_new_user_gates();

-- 기존 유저 중 user_gates 행이 없는 경우 보충
insert into public.user_gates (user_id)
select id from public.users
where id not in (select user_id from public.user_gates)
on conflict (user_id) do nothing;

-- ============================================
-- 보안 정책 (Row Level Security)
-- ============================================

alter table public.user_gates enable row level security;

-- 본인 것만 읽기
create policy "user_gates_select" on public.user_gates
  for select using (auth.uid() = user_id);

-- 본인만 삽입
create policy "user_gates_insert" on public.user_gates
  for insert with check (auth.uid() = user_id);

-- 본인만 수정
create policy "user_gates_update" on public.user_gates
  for update using (auth.uid() = user_id);
