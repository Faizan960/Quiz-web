// ─────────────────────────────────────────────────
// Quizly — Supabase Database Types
// Matches the sm_* schema tables
// ─────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      sm_profiles: {
        Row: {
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
        Insert: {
          id?: string
          username: string
          display_name: string
          pin_hash: string
          interests?: string[]
          archetype?: string | null
          is_suspended?: boolean
        }
        Update: Partial<{
          username: string
          display_name: string
          pin_hash: string
          interests: string[]
          archetype: string | null
          archetype_updated_at: string | null
          is_suspended: boolean
        }>
      }
      sm_questions: {
        Row: {
          id: string
          text: string
          category: string
          interest_tags: string[]
          options: Record<string, string>
          dimension: string
          is_active: boolean
          is_banned: boolean
          play_count: number
          created_at: string
        }
        Insert: {
          id?: string
          text: string
          category: string
          interest_tags?: string[]
          options: Record<string, string>
          dimension: string
          is_active?: boolean
          is_banned?: boolean
        }
        Update: Partial<{
          text: string
          category: string
          interest_tags: string[]
          options: Record<string, string>
          dimension: string
          is_active: boolean
          is_banned: boolean
          play_count: number
        }>
      }
      sm_responses: {
        Row: {
          id: string
          profile_id: string
          respondent_token: string
          answers: Record<string, string>
          dimension_scores: Record<string, number>
          overall_score: number
          completed_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          respondent_token: string
          answers: Record<string, string>
          dimension_scores: Record<string, number>
          overall_score: number
        }
        Update: Partial<{
          answers: Record<string, string>
          dimension_scores: Record<string, number>
          overall_score: number
        }>
      }
      sm_trivia: {
        Row: {
          id: string
          slug: string
          title: string
          category: string
          questions: unknown
          play_count: number
          is_banned: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          category: string
          questions: unknown
          is_banned?: boolean
        }
        Update: Partial<{
          title: string
          category: string
          questions: unknown
          play_count: number
          is_banned: boolean
        }>
      }
      sm_reports: {
        Row: {
          id: string
          target_type: string
          target_id: string
          reason: string
          reporter_token: string
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          target_type: string
          target_id: string
          reason: string
          reporter_token: string
          resolved?: boolean
        }
        Update: Partial<{
          resolved: boolean
        }>
      }
    }
    Views: {
      sm_profile_scores: {
        Row: {
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
      }
    }
    Functions: {
      increment_play_count: {
        Args: { p_trivia_id: string }
        Returns: void
      }
    }
  }
}
