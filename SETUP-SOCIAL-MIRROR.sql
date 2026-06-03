-- ═══════════════════════════════════════════════════════════════
-- SOCIAL MIRROR — Complete Database Schema
-- Copy this entire file and paste into Supabase SQL Editor
-- Then click "Run" to create all tables
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────
-- SM_PROFILES — User profiles for Social Mirror
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sm_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,
  display_name    TEXT NOT NULL,
  bio             TEXT,
  avatar_url      TEXT,
  interests       TEXT[] DEFAULT '{}',
  pin_hash        TEXT NOT NULL,
  total_responses INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- SM_QUESTIONS — Questions belonging to a profile
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sm_questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES public.sm_profiles(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  question_type   TEXT NOT NULL DEFAULT 'multiple_choice'
                  CHECK (question_type IN ('multiple_choice', 'scale', 'free_text')),
  category        TEXT NOT NULL DEFAULT 'personality'
                  CHECK (category IN ('personality', 'friendship', 'career', 'fun', 'college')),
  options         JSONB,
  dimension_map   JSONB,
  order_num       INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- options example for multiple_choice:
-- [
--   {"text": "Natural leader", "dimensions": {"leadership": 3, "ambition": 2}},
--   {"text": "Creative thinker", "dimensions": {"creativity": 3, "innovation": 2}},
--   {"text": "Loyal friend", "dimensions": {"trustworthiness": 3, "empathy": 2}},
--   {"text": "Life of the party", "dimensions": {"humor": 3, "charisma": 2}}
-- ]

-- ─────────────────────────────────────────────────
-- SM_RESPONSES — Friend responses to questions
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sm_responses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES public.sm_profiles(id) ON DELETE CASCADE,
  respondent_name TEXT,
  is_anonymous    BOOLEAN DEFAULT TRUE,
  session_id      TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- SM_ANSWERS — Individual answers within a response
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sm_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id     UUID NOT NULL REFERENCES public.sm_responses(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES public.sm_questions(id) ON DELETE CASCADE,
  answer_value    TEXT NOT NULL,
  answer_index    INT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- SM_REPORTS — Cached AI-generated reports
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sm_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES public.sm_profiles(id) ON DELETE CASCADE,
  report_type     TEXT NOT NULL DEFAULT 'standard'
                  CHECK (report_type IN ('standard', 'roast', 'compliment')),
  report_data     JSONB NOT NULL,
  response_count  INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sm_profiles_slug       ON public.sm_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_sm_questions_profile   ON public.sm_questions(profile_id, order_num);
CREATE INDEX IF NOT EXISTS idx_sm_responses_profile   ON public.sm_responses(profile_id);
CREATE INDEX IF NOT EXISTS idx_sm_answers_response    ON public.sm_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_sm_answers_question    ON public.sm_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_sm_reports_profile     ON public.sm_reports(profile_id, report_type);

-- ─────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────
ALTER TABLE public.sm_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sm_questions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sm_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sm_answers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sm_reports    ENABLE ROW LEVEL SECURITY;

-- Note: We enable RLS but do not define any public SELECT/INSERT/UPDATE policies
-- for anon/authenticated users. All database reads and writes are securely proxied
-- through Next.js server-side API routes using the Supabase Service Role client.

-- ─────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────────

-- Auto-increment total_responses when a new response is added
CREATE OR REPLACE FUNCTION public.sm_increment_responses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.sm_profiles
  SET total_responses = total_responses + 1,
      updated_at = NOW()
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_sm_response_created
  AFTER INSERT ON public.sm_responses
  FOR EACH ROW EXECUTE FUNCTION public.sm_increment_responses();

-- Auto-update updated_at on profile changes
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

CREATE OR REPLACE TRIGGER on_sm_report_updated
  BEFORE UPDATE ON public.sm_reports
  FOR EACH ROW EXECUTE FUNCTION public.sm_update_timestamp();
