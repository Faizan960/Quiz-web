-- ═══════════════════════════════════════════════════════════════
-- QUIZLY (Social Mirror) — Complete Full-Stack Schema
-- Copy this entire script and run it in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────
-- 1. SM_PROFILES — User accounts
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sm_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username              TEXT UNIQUE NOT NULL,
  display_name          TEXT NOT NULL,
  pin_hash              TEXT NOT NULL,
  interests             TEXT[] DEFAULT '{}',
  archetype             TEXT,
  archetype_updated_at  TIMESTAMPTZ,
  is_suspended          BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- 2. SM_QUESTIONS — Global question pool
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sm_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text          TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'personality',
  interest_tags TEXT[] DEFAULT '{}',
  options       JSONB NOT NULL, -- Format: {"A": "Choice A", "B": "Choice B", ...}
  dimension     TEXT NOT NULL CHECK (dimension IN ('charisma', 'resilience', 'loyalty', 'innovation', 'confidence', 'warmth', 'wit')),
  is_active     BOOLEAN DEFAULT TRUE,
  is_banned     BOOLEAN DEFAULT FALSE,
  play_count    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- 3. SM_RESPONSES — Anonymous friend ratings
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sm_responses (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        UUID NOT NULL REFERENCES public.sm_profiles(id) ON DELETE CASCADE,
  respondent_token  TEXT NOT NULL,
  answers           JSONB NOT NULL, -- Format: {"q-uuid": "A", "q2-uuid": "D", ...}
  dimension_scores  JSONB NOT NULL, -- Format: {"charisma": 75, "wit": 85, ...}
  overall_score     INT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  completed_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- 4. SM_TRIVIA — Custom community trivia games
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sm_trivia (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,
  questions   JSONB NOT NULL, -- Array: [{"question": "Text", "options": [...], "correct_index": 0}]
  play_count  INT DEFAULT 0,
  is_banned   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- 5. SM_REPORTS — Moderation content flagging
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sm_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type     TEXT NOT NULL CHECK (target_type IN ('profile', 'trivia')),
  target_id       TEXT NOT NULL,
  reason          TEXT NOT NULL,
  reporter_token  TEXT NOT NULL,
  resolved        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- 6. AD_SETTINGS — Administrator banner ads config
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ad_settings (
  id                    INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  home_banner_enabled   BOOLEAN DEFAULT FALSE,
  home_banner_code      TEXT,
  home_bottom_enabled   BOOLEAN DEFAULT FALSE,
  home_bottom_code      TEXT,
  player_start_enabled  BOOLEAN DEFAULT FALSE,
  player_start_code     TEXT,
  result_page_enabled   BOOLEAN DEFAULT FALSE,
  result_page_code      TEXT,
  between_q_enabled     BOOLEAN DEFAULT FALSE,
  between_q_code        TEXT,
  adsense_publisher_id  TEXT,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row for ads config
INSERT INTO public.ad_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────
-- 7. VIEWS — Aggregated User Ratings
-- ─────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.sm_profile_scores AS
SELECT
  r.profile_id,
  p.username,
  COUNT(r.id) as response_count,
  ROUND(AVG((r.dimension_scores->>'charisma')::numeric)) as charisma,
  ROUND(AVG((r.dimension_scores->>'resilience')::numeric)) as resilience,
  ROUND(AVG((r.dimension_scores->>'loyalty')::numeric)) as loyalty,
  ROUND(AVG((r.dimension_scores->>'innovation')::numeric)) as innovation,
  ROUND(AVG((r.dimension_scores->>'confidence')::numeric)) as confidence,
  ROUND(AVG((r.dimension_scores->>'warmth')::numeric)) as warmth,
  ROUND(AVG((r.dimension_scores->>'wit')::numeric)) as wit,
  ROUND(AVG(r.overall_score)) as avg_score
FROM public.sm_responses r
JOIN public.sm_profiles p ON r.profile_id = p.id
GROUP BY r.profile_id, p.username;

-- ─────────────────────────────────────────────────
-- 8. INDEXES
-- ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sm_profiles_username ON public.sm_profiles(username);
CREATE INDEX IF NOT EXISTS idx_sm_responses_profile ON public.sm_responses(profile_id);
CREATE INDEX IF NOT EXISTS idx_sm_questions_active  ON public.sm_questions(is_active, is_banned);
CREATE INDEX IF NOT EXISTS idx_sm_trivia_slug       ON public.sm_trivia(slug, is_banned);

-- ─────────────────────────────────────────────────
-- 9. RPC FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────────

-- Increment play count of trivia games or questions
CREATE OR REPLACE FUNCTION public.increment_play_count(p_trivia_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.sm_trivia
  SET play_count = play_count + 1
  WHERE id = p_trivia_id;

  UPDATE public.sm_questions
  SET play_count = play_count + 1
  WHERE id = p_trivia_id;
END;
$$;

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.sm_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_sm_profile_updated
  BEFORE UPDATE ON public.sm_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sm_update_timestamp();

CREATE OR REPLACE TRIGGER on_ad_settings_updated
  BEFORE UPDATE ON public.ad_settings
  FOR EACH ROW EXECUTE FUNCTION public.sm_update_timestamp();

-- ─────────────────────────────────────────────────
-- 10. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────
ALTER TABLE public.sm_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sm_questions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sm_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sm_trivia     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sm_reports    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_settings   ENABLE ROW LEVEL SECURITY;

-- Note: We enable RLS but do not configure policies for public users.
-- Reads/writes are securely proxied through Next.js server actions using the service_role key.
