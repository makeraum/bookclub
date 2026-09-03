-- ============================================================
-- 위드북 회비 · 회계 스키마
-- Supabase SQL Editor에서 이 파일 전체를 복사해 실행하세요.
--
-- 실행 순서: supabase-privacy.sql 다음, 즉 가장 마지막에 실행합니다.
--   1) supabase-schema.sql          8) supabase-coattendance.sql
--   2) supabase-highlights.sql      9) supabase-promises.sql
--   3) supabase-gates.sql          10) supabase-retrospective.sql
--   4) supabase-growth.sql         11) supabase-feedback.sql
--   5) supabase-dunbar.sql         12) supabase-privacy.sql
--   6) supabase-sentiment.sql      13) supabase-fees.sql   ← 이 파일
--   7) supabase-console.sql
--
-- 참고: 모임(event)은 아직 DB 테이블이 아니라 앱 상수(MOCK_OFFLINE_EVENTS)입니다.
--       그래서 event_id는 text이고, "이 모임의 서재지기"는 fees.host_id로 판단합니다.
--       나중에 events 테이블을 만들면 event_id를 uuid FK로 바꾸면 됩니다.
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
