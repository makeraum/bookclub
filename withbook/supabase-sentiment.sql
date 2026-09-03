-- ── highlight_sentiments 테이블 ──
-- 밑줄의 감성 분류를 저장하는 테이블.
-- 사용자에게 sentiment 값은 직접 노출하지 않음 (내부 매칭용).

CREATE TABLE highlight_sentiments (
  highlight_id uuid PRIMARY KEY REFERENCES highlights(id) ON DELETE CASCADE,
  sentiment text NOT NULL CHECK (sentiment IN ('positive', 'reserved', 'contrary')),
  analyzed_at timestamptz DEFAULT now()
);

ALTER TABLE highlight_sentiments ENABLE ROW LEVEL SECURITY;

-- 읽기는 누구나 가능 (매칭 로직에서 사용)
CREATE POLICY "Anyone can read sentiments"
  ON highlight_sentiments
  FOR SELECT
  USING (true);

-- 쓰기는 서버 사이드에서만 (service_role 키 사용)
-- 사용자가 직접 sentiment를 수정할 수 없음
