-- ============================================================
-- 위드북 — 입금 계좌를 서재지기가 직접 등록하도록 변경
-- Supabase SQL Editor에서 이 파일 전체를 복사해 실행하세요.
--
-- 실행 순서: supabase-fees.sql 다음. 즉 가장 마지막에 실행합니다.
--   … 12) supabase-privacy.sql
--      13) supabase-fees.sql
--      14) supabase-fee-accounts.sql   ← 이 파일
--   (supabase-remaining.sql로 12~13을 한 번에 실행했다면 그 다음에 실행하면 됩니다)
--
-- 여러 번 실행해도 안전합니다.
--   · add column if not exists
--   · drop policy if exists → create policy
--   · create or replace function
--
-- 이 파일이 하는 일
--   A. fees 테이블에 bank_name / account_number / account_holder 정리
--   B. 소유·참가 판정을 security definer 함수로 분리 (정책 안에서 RLS 재귀를 피하려고)
--   C. fees 읽기 권한을 "서재지기 + 그 모임 참가자"로 좁힘
--   D. fee_payments / expenses 정책을 같은 함수 기준으로 정리
-- ============================================================


-- ============================================================
-- A. 계좌 컬럼 정리
-- ============================================================
-- supabase-fees.sql에서는 bank_account였습니다. account_number로 이름을 맞추고,
-- 이미 들어 있던 값이 있으면 옮긴 뒤 예전 컬럼을 지웁니다.

alter table public.fees add column if not exists bank_name      text default '';
alter table public.fees add column if not exists account_number text default '';
alter table public.fees add column if not exists account_holder text default '';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'fees' and column_name = 'bank_account'
  ) then
    update public.fees
       set account_number = coalesce(nullif(account_number, ''), bank_account)
     where bank_account is not null;

    alter table public.fees drop column bank_account;
  end if;
end $$;

-- 회비 금액·기한은 서재지기가 콘솔에서 직접 넣습니다
alter table public.fees alter column amount drop not null;
alter table public.fees alter column amount set default 0;

comment on column public.fees.account_number is
  '입금 계좌번호. 서재지기와 해당 모임 참가자만 읽을 수 있습니다(아래 fees_select 정책).';


-- ============================================================
-- B. 소유·참가 판정 함수 (security definer)
-- ============================================================
-- 정책 표현식 안에서 다른 테이블을 조회하면 그 테이블의 RLS가 다시 걸려
-- 재귀하거나 의도치 않게 0건이 되는 일이 생깁니다.
-- security definer 함수로 감싸 판정만 안전하게 가져옵니다.

create or replace function public.is_event_fee_host(p_event_id text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.fees f
    where f.event_id = p_event_id and f.host_id = auth.uid()
  );
$$;

-- 참가자 = 이 모임에 납부 기록(미납 포함)이 있는 사람
create or replace function public.is_event_participant(p_event_id text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.fee_payments p
    where p.event_id = p_event_id and p.user_id = auth.uid()
  );
$$;

create or replace function public.is_event_settlement_public(p_event_id text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select f.settlement_public from public.fees f where f.event_id = p_event_id),
    false
  );
$$;

revoke all on function public.is_event_fee_host(text) from public;
revoke all on function public.is_event_participant(text) from public;
revoke all on function public.is_event_settlement_public(text) from public;
grant execute on function public.is_event_fee_host(text) to authenticated;
grant execute on function public.is_event_participant(text) to authenticated;
grant execute on function public.is_event_settlement_public(text) to authenticated;


-- ============================================================
-- C. fees 읽기 권한 좁히기
-- ============================================================
-- 예전에는 using (true)라 계좌번호가 로그인한 누구에게나 보였습니다.
-- 서재지기 본인과 그 모임 참가자만 읽도록 바꿉니다.
--
-- 참고: 모임 상세에 보이는 회비 "금액"은 이 테이블이 아니라 모임 정보에서 가져오므로,
--       아직 참가하지 않은 사람도 금액은 그대로 볼 수 있습니다.

drop policy if exists "fees_select" on public.fees;
create policy "fees_select" on public.fees
  for select using (
    auth.uid() = host_id
    or public.is_event_participant(event_id)
  );

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
-- D. fee_payments · expenses 정책을 같은 기준으로 정리
-- ============================================================

drop policy if exists "fee_payments_select" on public.fee_payments;
create policy "fee_payments_select" on public.fee_payments
  for select using (
    auth.uid() = user_id
    or public.is_event_fee_host(event_id)
  );

drop policy if exists "fee_payments_insert" on public.fee_payments;
create policy "fee_payments_insert" on public.fee_payments
  for insert with check (auth.uid() = user_id);

drop policy if exists "fee_payments_update" on public.fee_payments;
create policy "fee_payments_update" on public.fee_payments
  for update using (
    auth.uid() = user_id
    or public.is_event_fee_host(event_id)
  );

drop policy if exists "fee_payments_delete" on public.fee_payments;
create policy "fee_payments_delete" on public.fee_payments
  for delete using (public.is_event_fee_host(event_id));

drop policy if exists "expenses_select" on public.expenses;
create policy "expenses_select" on public.expenses
  for select using (
    public.is_event_fee_host(event_id)
    or (public.is_event_participant(event_id) and public.is_event_settlement_public(event_id))
  );

drop policy if exists "expenses_insert" on public.expenses;
create policy "expenses_insert" on public.expenses
  for insert with check (public.is_event_fee_host(event_id));

drop policy if exists "expenses_update" on public.expenses;
create policy "expenses_update" on public.expenses
  for update using (public.is_event_fee_host(event_id));

drop policy if exists "expenses_delete" on public.expenses;
create policy "expenses_delete" on public.expenses
  for delete using (public.is_event_fee_host(event_id));


-- ============================================================
-- 실행 후 확인
-- ============================================================
-- 1) 컬럼이 바뀌었는지 (bank_account가 없고 account_number가 있어야 합니다)
-- select column_name from information_schema.columns
--  where table_schema = 'public' and table_name = 'fees'
--  order by column_name;
--
-- 2) 남의 모임 계좌가 안 보이는지 (참가하지 않은 event_id로 조회 → 0건이어야 합니다)
-- select event_id, account_number from public.fees;
