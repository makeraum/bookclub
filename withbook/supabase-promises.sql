-- ── meeting_promises: 서재별 모임 약속 ──

CREATE TABLE meeting_promises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seojae_id text NOT NULL,
  text text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meeting_promises ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 읽기 가능 (모임 상세에서 표시)
CREATE POLICY "Anyone can read promises"
  ON meeting_promises
  FOR SELECT
  USING (true);

-- 서재지기(owner)만 수정 가능
CREATE POLICY "Seojae owner can manage promises"
  ON meeting_promises
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM seojae_members
      WHERE seojae_id = meeting_promises.seojae_id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );
