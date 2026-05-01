// ─────────────────────────────────────────────────
// Database Types — matches Supabase schema exactly
// ─────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      quizzes: {
        Row: Quiz
        Insert: Omit<Quiz, 'id' | 'created_at' | 'updated_at' | 'total_plays' | 'avg_score'>
        Update: Partial<Omit<Quiz, 'id' | 'created_at'>>
      }
      questions: {
        Row: Question
        Insert: Omit<Question, 'id' | 'created_at'>
        Update: Partial<Omit<Question, 'id' | 'created_at'>>
      }
      attempts: {
        Row: Attempt
        Insert: Omit<Attempt, 'id' | 'created_at'>
        Update: never
      }
      ad_settings: {
        Row: AdSettings
        Insert: Partial<AdSettings>
        Update: Partial<AdSettings>
      }
      site_settings: {
        Row: SiteSettings
        Insert: Partial<SiteSettings>
        Update: Partial<SiteSettings>
      }
    }
  }
}

export type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  total_quizzes: number
  total_plays: number
  is_banned: boolean
  created_at: string
  updated_at: string
}

export type Quiz = {
  id: string
  slug: string
  title: string
  description: string | null
  category: QuizCategory
  cover_image: string | null
  creator_id: string | null
  creator_name: string | null
  total_plays: number
  avg_score: number
  is_public: boolean
  is_featured: boolean
  is_reported: boolean
  is_banned: boolean
  created_at: string
  updated_at: string
}

export type Question = {
  id: string
  quiz_id: string
  question_text: string
  image_url: string | null
  options: string[]
  correct_index: number
  order_num: number
  created_at: string
}

export type Attempt = {
  id: string
  quiz_id: string
  player_id: string | null
  player_name: string
  score: number
  total: number
  time_taken_sec: number | null
  created_at: string
}

export type AdSettings = {
  id: number
  home_banner_enabled: boolean
  home_banner_code: string | null
  home_bottom_enabled: boolean
  home_bottom_code: string | null
  player_start_enabled: boolean
  player_start_code: string | null
  result_page_enabled: boolean
  result_page_code: string | null
  between_q_enabled: boolean
  between_q_code: string | null
  adsense_publisher_id: string | null
  updated_at: string
}

export type SiteSettings = {
  id: number
  site_name: string
  tagline: string
  ga_id: string | null
  updated_at: string
}

export type QuizCategory =
  | 'besties'
  | 'couples'
  | 'kpop'
  | 'fun'
  | 'movies'
  | 'gaming'

// ─────────────────────────────────────────────────
// App-level types (frontend use)
// ─────────────────────────────────────────────────

export type QuizWithQuestions = Quiz & {
  questions: Question[]
}

export type LeaderboardEntry = {
  player_name: string
  score: number
  total: number
  created_at: string
}

export type CreateQuizPayload = {
  title: string
  description?: string
  category: QuizCategory
  creator_name: string
  questions: {
    question_text: string
    options: string[]
    correct_index: number
    image_url?: string
  }[]
}
