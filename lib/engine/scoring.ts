// ─────────────────────────────────────────────────
// Quizly — Dimension Score Calculation
// ─────────────────────────────────────────────────

import type { DimensionScores, DimensionKey, AnswerKey } from '@/types/quiz'
import { DIMENSION_KEYS } from '@/types/quiz'

/** Map answer letter to numeric value */
const ANSWER_VALUES: Record<AnswerKey, number> = {
  A: 100,
  B: 75,
  C: 50,
  D: 25,
}

/** Dimension weights for overall score calculation */
const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  charisma: 0.16,
  resilience: 0.14,
  loyalty: 0.16,
  innovation: 0.13,
  confidence: 0.15,
  warmth: 0.14,
  wit: 0.12,
}

/**
 * Calculate dimension scores from quiz answers.
 *
 * Groups answers by the dimension their question maps to,
 * converts A→100, B→75, C→50, D→25, and averages each group.
 */
export function calculateDimensionScores(
  answers: Record<string, AnswerKey>,
  questions: Array<{ id: string; dimension: DimensionKey }>
): DimensionScores {
  // Build dimension → values map
  const dimensionValues: Record<DimensionKey, number[]> = {} as Record<DimensionKey, number[]>
  for (const key of DIMENSION_KEYS) {
    dimensionValues[key] = []
  }

  for (const question of questions) {
    const answer = answers[question.id]
    if (answer && ANSWER_VALUES[answer] !== undefined) {
      dimensionValues[question.dimension].push(ANSWER_VALUES[answer])
    }
  }

  // Average each dimension
  const scores: DimensionScores = {} as DimensionScores
  for (const key of DIMENSION_KEYS) {
    const values = dimensionValues[key]
    if (values.length === 0) {
      scores[key] = 50 // Default to midpoint if no questions for this dimension
    } else {
      scores[key] = Math.round(
        values.reduce((sum, v) => sum + v, 0) / values.length
      )
    }
  }

  return scores
}

/**
 * Calculate weighted overall score from dimension scores.
 * Returns integer 0–100.
 */
export function calculateOverallScore(scores: DimensionScores): number {
  let weightedSum = 0
  for (const key of DIMENSION_KEYS) {
    weightedSum += scores[key] * DIMENSION_WEIGHTS[key]
  }
  return Math.round(weightedSum)
}
