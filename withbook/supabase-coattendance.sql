-- 동석 기록 사용자 읽기 RLS 정책
-- co_attendances 테이블에 대해 본인의 동석 기록만 조회 가능하도록 설정

-- RLS 활성화 (이미 활성화되어 있을 수 있음)
ALTER TABLE co_attendances ENABLE ROW LEVEL SECURITY;

-- 사용자 본인의 동석 기록 읽기 정책
CREATE POLICY "Users can read own co-attendance records"
  ON co_attendances
  FOR SELECT
  USING (user_id = auth.uid());
