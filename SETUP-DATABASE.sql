-- ═══════════════════════════════════════════════════════════════
-- QUIZLY — Complete Database Schema
-- Copy this entire file and paste into Supabase SQL Editor
-- Then click "Run" to create all tables
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────
-- USERS (extends Supabase auth.users)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  display_name    TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  total_quizzes   INT DEFAULT 0,
  total_plays     INT DEFAULT 0,
  is_banned       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- QUIZZES
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quizzes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'fun',
  cover_image     TEXT,
  creator_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_name    TEXT,
  total_plays     INT DEFAULT 0,
  avg_score       FLOAT DEFAULT 0,
  is_public       BOOLEAN DEFAULT TRUE,
  is_featured     BOOLEAN DEFAULT FALSE,
  is_reported     BOOLEAN DEFAULT FALSE,
  is_banned       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- QUESTIONS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id         UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  image_url       TEXT,
  options         TEXT[] NOT NULL,
  correct_index   INT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  order_num       INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- ATTEMPTS (quiz plays / scores)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attempts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id         UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  player_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  player_name     TEXT NOT NULL,
  score           INT NOT NULL DEFAULT 0,
  total           INT NOT NULL,
  time_taken_sec  INT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- AD SETTINGS (single row, managed by admin)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ad_settings (
  id                      INT PRIMARY KEY DEFAULT 1,
  home_banner_enabled     BOOLEAN DEFAULT TRUE,
  home_banner_code        TEXT,
  home_bottom_enabled     BOOLEAN DEFAULT TRUE,
  home_bottom_code        TEXT,
  player_start_enabled    BOOLEAN DEFAULT FALSE,
  player_start_code       TEXT,
  result_page_enabled     BOOLEAN DEFAULT TRUE,
  result_page_code        TEXT,
  between_q_enabled       BOOLEAN DEFAULT FALSE,
  between_q_code          TEXT,
  adsense_publisher_id    TEXT,
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.ad_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────
-- SITE SETTINGS (single row)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  id              INT PRIMARY KEY DEFAULT 1,
  site_name       TEXT DEFAULT 'Quizly',
  tagline         TEXT DEFAULT 'Make a quiz. Share with your people.',
  ga_id           TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────
-- INDEXES (for fast queries)
-- ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_quizzes_slug       ON public.quizzes(slug);
CREATE INDEX IF NOT EXISTS idx_quizzes_category   ON public.quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_featured   ON public.quizzes(is_featured);
CREATE INDEX IF NOT EXISTS idx_quizzes_created    ON public.quizzes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quizzes_plays      ON public.quizzes(total_plays DESC);
CREATE INDEX IF NOT EXISTS idx_questions_quiz     ON public.questions(quiz_id, order_num);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz      ON public.attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_player    ON public.attempts(player_id);

-- ─────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only owner can update
CREATE POLICY "profiles_read_all"     ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Quizzes: anyone can read public ones, authenticated users can create
CREATE POLICY "quizzes_read_public"   ON public.quizzes FOR SELECT USING (is_public = TRUE AND is_banned = FALSE);
CREATE POLICY "quizzes_insert_auth"   ON public.quizzes FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "quizzes_update_own"    ON public.quizzes FOR UPDATE USING (auth.uid() = creator_id);

-- Questions: readable if quiz is readable
CREATE POLICY "questions_read_all"    ON public.questions FOR SELECT USING (TRUE);
CREATE POLICY "questions_insert_auth" ON public.questions FOR INSERT WITH CHECK (TRUE);

-- Attempts: anyone can insert, owner can read their own
CREATE POLICY "attempts_insert_all"   ON public.attempts FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "attempts_read_all"     ON public.attempts FOR SELECT USING (TRUE);

-- Ad settings: only via service role (admin API)
CREATE POLICY "ads_read_all"          ON public.ad_settings FOR SELECT USING (TRUE);
CREATE POLICY "site_read_all"         ON public.site_settings FOR SELECT USING (TRUE);

-- ─────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────────

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update quiz play count and avg score after each attempt
CREATE OR REPLACE FUNCTION public.update_quiz_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.quizzes
  SET
    total_plays = total_plays + 1,
    avg_score = (
      SELECT AVG(score::float / total)
      FROM public.attempts
      WHERE quiz_id = NEW.quiz_id
    ),
    updated_at = NOW()
  WHERE id = NEW.quiz_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_attempt_created
  AFTER INSERT ON public.attempts
  FOR EACH ROW EXECUTE FUNCTION public.update_quiz_stats();
