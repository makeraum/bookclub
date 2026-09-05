-- ─────────────────────────────────────────────────────────────
-- 실시간 전달 확인 때 남은 빈 테스트 방 3개 정리
--
--   rt-249084 · rt-verify-288900 · rt-ui-336119
--
-- 왜 앱에서 못 지우나: chat_rooms에는 일부러 delete 정책을 두지 않았습니다
-- (supabase-schema-chat.sql 참고 — 남의 방을 지울 수 없게 하려는 의도).
-- 그래서 정리는 SQL Editor에서만 합니다. SQL Editor는 RLS를 우회합니다.
--
-- 실행 방법: Supabase 대시보드 → SQL Editor.
-- SQL Editor는 마지막 문장의 결과만 보여주므로, 아래 1·2·3단계를 하나씩 실행하세요.
-- 여러 번 실행해도 안전합니다.
-- ─────────────────────────────────────────────────────────────


-- ── 1단계. 지우기 전 확인 ──
-- 세 방이 정말로 비어 있는지 봅니다. members·messages가 모두 0이어야 합니다.
select
  r.id,
  r.name,
  r.type,
  r.created_at,
  (select count(*) from public.chat_members  m where m.room_id = r.id) as members,
  (select count(*) from public.chat_messages g where g.room_id = r.id) as messages
from public.chat_rooms r
where r.id in ('rt-249084', 'rt-verify-288900', 'rt-ui-336119')
order by r.id;


-- ── 2단계. 삭제 ──
-- 비어 있는 방만 지웁니다. 멤버나 메시지가 하나라도 남아 있으면 그 방은 건너뜁니다
-- (chat_members·chat_messages의 FK가 on delete cascade라 실수로 지우면 같이 날아갑니다).
delete from public.chat_rooms r
where r.id in ('rt-249084', 'rt-verify-288900', 'rt-ui-336119')
  and not exists (select 1 from public.chat_members  m where m.room_id = r.id)
  and not exists (select 1 from public.chat_messages g where g.room_id = r.id);


-- ── 3단계. 결과 확인 ──
-- 0행이면 정리 완료입니다.
-- 행이 남았다면 그 방에는 아직 멤버나 메시지가 있다는 뜻이니 1단계를 다시 보세요.
select id, name, type
from public.chat_rooms
where id in ('rt-249084', 'rt-verify-288900', 'rt-ui-336119');


-- ── 4단계. 이번 확인 작업에서 만든 임시 계정 삭제 ──
-- 왜 남았나: "보낸 사람 이름" 수정을 확인하려면 프로필 이름이 비어 있는 두 번째 계정이
-- 필요해서 임시 계정을 하나 만들었습니다. 메시지와 방 멤버십은 지웠지만,
-- 계정 자체를 지우려던 delete_my_account()가 아래 5단계의 버그로 실패해 auth 행만 남았습니다.
--
-- 지우기 전 확인 (1행 나오면 정상):
select id, email, created_at
from auth.users
where id = 'ed3782ba-b7b0-4d50-be54-d3fe9e177daa';

-- 삭제 (chat_members는 cascade, chat_messages.sender_id는 set null이지만 메시지는 이미 지웠습니다):
delete from auth.users
where id = 'ed3782ba-b7b0-4d50-be54-d3fe9e177daa';


-- ── 5단계. delete_my_account() 버그 수정 (권장) ──
-- 배포된 함수가 pair_daily_reactions를 user_id로 지우려 하는데, 이 테이블의 소유자 컬럼은
-- reactor_id입니다(supabase-dunbar.sql). 세 번째 문장에서 42703으로 중단되기 때문에
-- 지금은 "회원 탈퇴"가 누구에게도 동작하지 않습니다.
--
-- 저장소의 supabase-privacy.sql · supabase-remaining.sql은 이미 고쳐 두었습니다.
-- 아래 한 줄만 실행해도 되고, supabase-privacy.sql의 C절을 통째로 다시 실행해도 됩니다.
-- (함수는 create or replace라 여러 번 실행해도 안전합니다)
--
-- 확인용 — 고쳐졌는지 보려면 함수 본문에서 해당 줄을 찾습니다:
select position('pair_daily_reactions where reactor_id' in prosrc) > 0 as 수정됨
from pg_proc
where proname = 'delete_my_account';
