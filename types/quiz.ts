// ─────────────────────────────────────────────────
// Quizly — Core Quiz Types
// ─────────────────────────────────────────────────

/** The 7 personality dimensions measured by Quizly */
export type DimensionKey =
  | 'charisma'
  | 'resilience'
  | 'loyalty'
  | 'innovation'
  | 'confidence'
  | 'warmth'
  | 'wit'

/** All dimension keys as a readonly array */
export const DIMENSION_KEYS: readonly DimensionKey[] = [
  'charisma',
  'resilience',
  'loyalty',
  'innovation',
  'confidence',
  'warmth',
  'wit',
] as const

/** Human-readable labels for each dimension */
export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  charisma: 'Charisma',
  resilience: 'Resilience',
  loyalty: 'Loyalty',
  innovation: 'Innovation',
  confidence: 'Confidence',
  warmth: 'Warmth',
  wit: 'Wit',
}

/** Scores for all 7 dimensions (0–100 each) */
export type DimensionScores = Record<DimensionKey, number>

/** Answer key for quiz options */
export type AnswerKey = 'A' | 'B' | 'C' | 'D'

/** Question category */
export type QuestionCategory =
  | 'personality'
  | 'social'
  | 'humor'
  | 'resilience'
  | 'loyalty'
  | 'creativity'

/** Question option format stored in JSONB */
export interface QuestionOptions {
  A: string
  B: string
  C: string
  D: string
}

/** A question from sm_questions */
export interface Question {
  id: string
  text: string
  category: QuestionCategory
  interest_tags: string[]
  options: QuestionOptions
  dimension: DimensionKey
  is_active: boolean
  is_banned: boolean
  play_count: number
  created_at: string
}

/** A user profile from sm_profiles */
export interface Profile {
  id: string
  username: string
  display_name: string
  pin_hash: string
  interests: string[]
  archetype: string | null
  archetype_updated_at: string | null
  is_suspended: boolean
  created_at: string
  updated_at: string
}

/** Public-safe profile (no pin_hash) */
export type PublicProfile = Omit<Profile, 'pin_hash'>

/** A response from sm_responses */
export interface Response {
  id: string
  profile_id: string
  respondent_token: string
  answers: Record<string, AnswerKey>
  dimension_scores: DimensionScores
  overall_score: number
  completed_at: string
}

/** Aggregated profile scores from sm_profile_scores view */
export interface ProfileScores {
  profile_id: string
  username: string
  response_count: number
  charisma: number
  resilience: number
  loyalty: number
  innovation: number
  confidence: number
  warmth: number
  wit: number
  avg_score: number
}

/** Trivia game from sm_trivia */
export interface Trivia {
  id: string
  slug: string
  title: string
  category: string
  questions: TriviaQuestion[]
  play_count: number
  is_banned: boolean
  created_at: string
}

/** A single trivia question */
export interface TriviaQuestion {
  question: string
  options: string[]
  correct_index: number
}

/** Report from sm_reports */
export interface Report {
  id: string
  target_type: 'profile' | 'trivia'
  target_id: string
  reason: string
  reporter_token: string
  resolved: boolean
  created_at: string
}

/** Archetype definition */
export interface Archetype {
  id: string
  name: string
  description: string
  roast: string
  primaryDimensions: DimensionKey[]
  minScores: Partial<Record<DimensionKey, number>>
  isDefault?: boolean
}

/** Insight card */
export interface InsightCard {
  type: 'strength' | 'blindspot' | 'surprising'
  title: string
  description: string
  emoji: string
}
