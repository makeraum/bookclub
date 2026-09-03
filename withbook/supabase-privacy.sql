-- ============================================================
-- 위드북 개인정보 동의·탈퇴 스키마 (개인정보보호법 대응)
-- Supabase SQL Editor에서 이 파일 전체를 복사해 실행하세요.
--
-- 실행 순서: 다른 스키마 파일을 모두 실행한 뒤 마지막에 실행합니다.
--   1) supabase-schema.sql
--   2) supabase-highlights.sql
--   3) supabase-gates.sql
--   4) supabase-growth.sql
--   5) supabase-dunbar.sql
--   6) supabase-sentiment.sql
--   7) supabase-console.sql
--   8) supabase-coattendance.sql
--   9) supabase-promises.sql
--  10) supabase-retrospective.sql
--  11) supabase-feedback.sql
--  12) supabase-privacy.sql   ← 이 파일
--
-- 이 파일은 아래 세 가지를 합니다.
--   A. user_consents 테이블 (동의 이력, append-only)
--   B. 탈퇴 시 서재 주인 자리를 비울 수 있도록 seojae.owner_id 제약 완화
--   C. delete_my_account() — 본인 계정과 기록을 실제로 삭제하는 함수
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
    delete from public.pair_daily_reactions where user_id = uid;
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
