// ─────────────────────────────────────────────────
// Quizly — API Request/Response Types
// ─────────────────────────────────────────────────

import type { DimensionScores, AnswerKey, PublicProfile, ProfileScores, Archetype, InsightCard } from './quiz'

// ─── Profile API ───────────────────────────────

export interface CreateProfileRequest {
  username: string
  displayName: string
  pin: string
  interests: string[]
}

export interface CreateProfileResponse {
  username: string
  displayName: string
  shareUrl: string
}

// ─── Response API ──────────────────────────────

export interface SubmitResponseRequest {
  profileId: string
  answers: Record<string, AnswerKey>
}

export interface SubmitResponseResponse {
  success: true
  overallScore: number
}

// ─── PIN API ───────────────────────────────────

export interface VerifyPinRequest {
  username: string
  pin: string
}

export interface VerifyPinSuccessResponse {
  token: string
  profileId: string
}

export interface VerifyPinFailureResponse {
  error: string
  remainingAttempts: number
  lockoutUntil?: string
}

// ─── Report Data (PIN-gated) ───────────────────

export interface ReportData {
  profile: PublicProfile
  scores: ProfileScores
  dimensionScores: DimensionScores
  archetype: Archetype
  insights: InsightCard[]
  responseCount: number
}

// ─── Admin API ─────────────────────────────────

export interface AdminLoginRequest {
  password: string
}

export interface AdminLoginResponse {
  token: string
}

export interface AdminUserItem {
  id: string
  username: string
  display_name: string
  is_suspended: boolean
  response_count: number
  created_at: string
}

export interface AdminTriviaItem {
  id: string
  slug: string
  title: string
  category: string
  play_count: number
  is_banned: boolean
  created_at: string
}

// ─── Generic Error Response ────────────────────

export interface ApiError {
  error: string
  code: string
}
