-- ============================================================
-- supabase-dunbar.sql
-- 던바 구조 (L1~L4) 테이블 + RLS
-- 실행 순서: schema → highlights → gates → schema-chat → dunbar
-- 멱등(idempotent): 여러 번 실행해도 안전
-- ============================================================

-- ── chat_rooms type 제약 확장 ──
ALTER TABLE public.chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_type_check;
ALTER TABLE public.chat_rooms ADD CONSTRAINT chat_rooms_type_check
  CHECK (type IN ('club', 'event', 'seojae', 'highlight_pair'));

-- ============================================================
-- L4  도시 커뮤니티
-- ============================================================

CREATE TABLE IF NOT EXISTS public.city_communities (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  region     text NOT NULL UNIQUE
             CHECK (region IN ('천안', '대전', '세종', '청주')),
  name       text NOT NULL,
  description text DEFAULT '',
  max_members int DEFAULT 150,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.city_communities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "city_communities_select" ON public.city_communities;
CREATE POLICY "city_communities_select" ON public.city_communities
  FOR SELECT USING (true);

-- L4 기수
CREATE TABLE IF NOT EXISTS public.city_cohorts (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL REFERENCES public.city_communities(id) ON DELETE CASCADE,
  label        text NOT NULL,          -- e.g. '9월 기수'
  start_date   date NOT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.city_cohorts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "city_cohorts_select" ON public.city_cohorts;
CREATE POLICY "city_cohorts_select" ON public.city_cohorts
  FOR SELECT USING (true);

-- L4 멤버
CREATE TABLE IF NOT EXISTS public.city_community_members (
  community_id uuid NOT NULL REFERENCES public.city_communities(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id    uuid REFERENCES public.city_cohorts(id),
  role         text DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at    timestamptz DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

ALTER TABLE public.city_community_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ccm_select" ON public.city_community_members;
CREATE POLICY "ccm_select" ON public.city_community_members
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "ccm_insert_own" ON public.city_community_members;
CREATE POLICY "ccm_insert_own" ON public.city_community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "ccm_delete_own" ON public.city_community_members;
CREATE POLICY "ccm_delete_own" ON public.city_community_members
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- L2  서재
-- ============================================================

CREATE TABLE IF NOT EXISTS public.seojae (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id      uuid NOT NULL REFERENCES public.city_communities(id) ON DELETE CASCADE,
  name              text NOT NULL,
  description       text DEFAULT '',
  owner_id          uuid NOT NULL REFERENCES auth.users(id),
  chat_room_id      text REFERENCES public.chat_rooms(id),
  max_members       int DEFAULT 15,
  monthly_offline_day text DEFAULT '',   -- e.g. '매월 셋째 토요일'
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE public.seojae ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seojae_select" ON public.seojae;
CREATE POLICY "seojae_select" ON public.seojae
  FOR SELECT USING (true);

-- L2 멤버
CREATE TABLE IF NOT EXISTS public.seojae_members (
  seojae_id uuid NOT NULL REFERENCES public.seojae(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      text DEFAULT 'member' CHECK (role IN ('member', 'owner')),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (seojae_id, user_id)
);

ALTER TABLE public.seojae_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sm_select" ON public.seojae_members;
CREATE POLICY "sm_select" ON public.seojae_members
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "sm_insert_own" ON public.seojae_members;
CREATE POLICY "sm_insert_own" ON public.seojae_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "sm_delete_own" ON public.seojae_members;
CREATE POLICY "sm_delete_own" ON public.seojae_members
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- L3  책방
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chaekbang (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id          uuid NOT NULL REFERENCES public.city_communities(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  description           text DEFAULT '',
  quarterly_meeting_info text DEFAULT '',
  max_seojae            int DEFAULT 4,
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE public.chaekbang ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chaekbang_select" ON public.chaekbang;
CREATE POLICY "chaekbang_select" ON public.chaekbang
  FOR SELECT USING (true);

-- L3 ↔ L2 매핑
CREATE TABLE IF NOT EXISTS public.chaekbang_seojae (
  chaekbang_id uuid NOT NULL REFERENCES public.chaekbang(id) ON DELETE CASCADE,
  seojae_id    uuid NOT NULL REFERENCES public.seojae(id) ON DELETE CASCADE,
  PRIMARY KEY (chaekbang_id, seojae_id)
);

ALTER TABLE public.chaekbang_seojae ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cs_select" ON public.chaekbang_seojae;
CREATE POLICY "cs_select" ON public.chaekbang_seojae
  FOR SELECT USING (true);

-- ============================================================
-- L1  밑줄 짝
-- ============================================================

CREATE TABLE IF NOT EXISTS public.highlight_pairs (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seojae_id             uuid NOT NULL REFERENCES public.seojae(id) ON DELETE CASCADE,
  user_a                uuid NOT NULL REFERENCES auth.users(id),
  user_b                uuid NOT NULL REFERENCES auth.users(id),
  book_isbn             text NOT NULL,
  book_title            text NOT NULL,
  chat_room_id          text REFERENCES public.chat_rooms(id),
  streak_count          int DEFAULT 0,
  last_interaction_date date,
  period_start          date NOT NULL DEFAULT CURRENT_DATE,
  period_end            date,
  is_active             boolean DEFAULT true,
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE public.highlight_pairs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hp_select_own" ON public.highlight_pairs;
CREATE POLICY "hp_select_own" ON public.highlight_pairs
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

-- L1 하루 한 줄 반응
CREATE TABLE IF NOT EXISTS public.pair_daily_reactions (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id      uuid NOT NULL REFERENCES public.highlight_pairs(id) ON DELETE CASCADE,
  reactor_id   uuid NOT NULL REFERENCES auth.users(id),
  highlight_id uuid REFERENCES public.highlights(id),
  reacted_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at   timestamptz DEFAULT now(),
  UNIQUE (pair_id, reactor_id, reacted_date)
);

ALTER TABLE public.pair_daily_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pdr_select_own" ON public.pair_daily_reactions;
CREATE POLICY "pdr_select_own" ON public.pair_daily_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.highlight_pairs hp
      WHERE hp.id = pair_id
        AND (hp.user_a = auth.uid() OR hp.user_b = auth.uid())
    )
  );
DROP POLICY IF EXISTS "pdr_insert_own" ON public.pair_daily_reactions;
CREATE POLICY "pdr_insert_own" ON public.pair_daily_reactions
  FOR INSERT WITH CHECK (auth.uid() = reactor_id);

-- ============================================================
-- 시드 데이터: 4개 도시 커뮤니티
-- ============================================================

INSERT INTO public.city_communities (region, name, description) VALUES
  ('대전', '대전 위드북', '대전 독서 커뮤니티'),
  ('천안', '천안 위드북', '천안 독서 커뮤니티'),
  ('세종', '세종 위드북', '세종 독서 커뮤니티'),
  ('청주', '청주 위드북', '청주 독서 커뮤니티')
ON CONFLICT (region) DO NOTHING;

-- ============================================================
-- 인덱스
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_seojae_community ON public.seojae(community_id);
CREATE INDEX IF NOT EXISTS idx_seojae_members_user ON public.seojae_members(user_id);
CREATE INDEX IF NOT EXISTS idx_highlight_pairs_users ON public.highlight_pairs(user_a, user_b);
CREATE INDEX IF NOT EXISTS idx_pair_daily_pair ON public.pair_daily_reactions(pair_id, reacted_date);
