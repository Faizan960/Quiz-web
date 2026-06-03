// ─────────────────────────────────────────────────
// Social Mirror Types
// ─────────────────────────────────────────────────

export type QuestionCategory = 'personality' | 'friendship' | 'career' | 'fun' | 'college'
export type QuestionType = 'multiple_choice' | 'scale' | 'free_text'
export type ReportType = 'standard' | 'roast' | 'compliment'

export type Dimension =
  | 'leadership'
  | 'creativity'
  | 'empathy'
  | 'ambition'
  | 'humor'
  | 'trustworthiness'
  | 'intelligence'
  | 'charisma'
  | 'resilience'
  | 'loyalty'
  | 'innovation'
  | 'confidence'

export interface DimensionScores {
  [key: string]: number
}

export interface QuestionOption {
  text: string
  dimensions: DimensionScores
}

// ─── Database Row Types ────────────────────────

export interface SmProfile {
  id: string
  slug: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  interests: string[]
  pin_hash: string
  total_responses: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SmQuestion {
  id: string
  profile_id: string
  question_text: string
  question_type: QuestionType
  category: QuestionCategory
  options: QuestionOption[] | null
  dimension_map: DimensionScores | null
  order_num: number
  created_at: string
}

export interface SmResponse {
  id: string
  profile_id: string
  respondent_name: string | null
  is_anonymous: boolean
  session_id: string
  created_at: string
}

export interface SmAnswer {
  id: string
  response_id: string
  question_id: string
  answer_value: string
  answer_index: number | null
  created_at: string
}

export interface SmReport {
  id: string
  profile_id: string
  report_type: ReportType
  report_data: ReportData
  response_count: number
  created_at: string
  updated_at: string
}

// ─── Report Data Structure ─────────────────────

export interface ReportData {
  archetype: string
  archetype_emoji: string
  archetype_description: string
  strengths: string[]
  weaknesses: string[]
  hidden_talent: string
  friend_impression: string
  scores: {
    leadership: number
    creativity: number
    empathy: number
    ambition: number
    humor: number
    trustworthiness: number
    intelligence: number
    charisma: number
    resilience: number
    loyalty: number
    confidence: number
  }
  roast: string
  compliment: string
  response_count: number
}

// ─── API Payloads ──────────────────────────────

export interface CreateProfilePayload {
  display_name: string
  bio?: string
  interests: string[]
  pin: string
  categories: QuestionCategory[]
}

export interface SubmitResponsePayload {
  respondent_name?: string
  is_anonymous: boolean
  answers: {
    question_id: string
    answer_value: string
    answer_index?: number
  }[]
}

// ─── App-Level Types ───────────────────────────

export interface ProfileWithQuestions extends SmProfile {
  questions: SmQuestion[]
}

export interface Archetype {
  name: string
  emoji: string
  description: string
  primary_dimensions: Dimension[]
  tagline: string
}
