// ─────────────────────────────────────────────────
// Social Mirror — Response Analyzer
// Aggregates friend responses into dimension scores
// and generates structured reports
// ─────────────────────────────────────────────────

import type { SmQuestion, SmAnswer, ReportData, QuestionOption } from '@/types/social-mirror'
import { determineArchetype, getTopDimensions, getBottomDimensions } from './archetypes'
import {
  generateStrengths,
  generateWeaknesses,
  generateHiddenTalent,
  generateFriendImpression,
  generateRoast,
  generateCompliment,
} from './templates'

// All trackable dimensions
const ALL_DIMENSIONS = [
  'leadership', 'creativity', 'empathy', 'ambition', 'humor',
  'trustworthiness', 'intelligence', 'charisma', 'resilience',
  'loyalty', 'innovation', 'confidence',
]

/**
 * Aggregates raw dimension scores from all answers.
 *
 * For each answer, we look up the question's options to find
 * the dimension weights for the chosen option, then sum them.
 */
export function aggregateScores(
  questions: SmQuestion[],
  answers: SmAnswer[]
): Record<string, number> {
  const rawScores: Record<string, number> = {}
  const counts: Record<string, number> = {}

  // Initialize
  for (const dim of ALL_DIMENSIONS) {
    rawScores[dim] = 0
    counts[dim] = 0
  }

  // Build a question lookup
  const questionMap = new Map<string, SmQuestion>()
  for (const q of questions) {
    questionMap.set(q.id, q)
  }

  // Process each answer
  for (const answer of answers) {
    const question = questionMap.get(answer.question_id)
    if (!question || !question.options) continue

    const options = question.options as QuestionOption[]

    // Find the chosen option by index or text match
    let chosenOption: QuestionOption | undefined
    if (answer.answer_index !== null && answer.answer_index !== undefined) {
      chosenOption = options[answer.answer_index]
    }
    if (!chosenOption) {
      chosenOption = options.find(o => o.text === answer.answer_value)
    }

    if (!chosenOption?.dimensions) continue

    // Add dimension scores
    for (const [dim, weight] of Object.entries(chosenOption.dimensions)) {
      rawScores[dim] = (rawScores[dim] ?? 0) + weight
      counts[dim] = (counts[dim] ?? 0) + 1
    }
  }

  return rawScores
}

/**
 * Normalizes raw scores to 0-100 percentages.
 *
 * Uses the theoretical max per dimension based on the number of responses
 * and the maximum possible weight per question (typically 3).
 */
export function normalizeScores(
  rawScores: Record<string, number>,
  responseCount: number
): Record<string, number> {
  const normalized: Record<string, number> = {}

  // The max a dimension could score = responseCount * maxWeightPerQuestion * avgQuestionsContributing
  // We use a dynamic approach: scale based on the highest raw score
  const maxRaw = Math.max(...Object.values(rawScores), 1)

  for (const dim of ALL_DIMENSIONS) {
    const raw = rawScores[dim] ?? 0
    // Scale to 0-100, but cap at 98 and floor at 15 for aesthetics
    // (nobody gets a perfect 100 or a depressing 0)
    let pct = Math.round((raw / maxRaw) * 100)
    pct = Math.max(15, Math.min(98, pct))

    // Add slight randomization (±3) to avoid identical scores
    const jitter = Math.floor(Math.random() * 7) - 3
    pct = Math.max(15, Math.min(98, pct + jitter))

    normalized[dim] = pct
  }

  return normalized
}

/**
 * Generates a complete report from questions and answers.
 *
 * This is the main entry point for the analysis engine.
 */
export function generateReport(
  displayName: string,
  questions: SmQuestion[],
  answers: SmAnswer[],
  responseCount: number
): ReportData {
  // 1. Aggregate raw scores
  const rawScores = aggregateScores(questions, answers)

  // 2. Normalize to percentages
  const scores = normalizeScores(rawScores, responseCount)

  // 3. Determine archetype
  const archetype = determineArchetype(scores)

  // 4. Generate text content
  const strengths = generateStrengths(scores, 3)
  const weaknesses = generateWeaknesses(scores, 2)
  const hiddenTalent = generateHiddenTalent(scores)
  const friendImpression = generateFriendImpression(scores)
  const roast = generateRoast(displayName, scores, archetype, responseCount)
  const compliment = generateCompliment(displayName, scores, archetype, responseCount)

  return {
    archetype: archetype.name,
    archetype_emoji: archetype.emoji,
    archetype_description: archetype.description,
    strengths,
    weaknesses,
    hidden_talent: hiddenTalent,
    friend_impression: friendImpression,
    scores: {
      leadership: scores.leadership ?? 50,
      creativity: scores.creativity ?? 50,
      empathy: scores.empathy ?? 50,
      ambition: scores.ambition ?? 50,
      humor: scores.humor ?? 50,
      trustworthiness: scores.trustworthiness ?? 50,
      intelligence: scores.intelligence ?? 50,
      charisma: scores.charisma ?? 50,
      resilience: scores.resilience ?? 50,
      loyalty: scores.loyalty ?? 50,
      confidence: scores.confidence ?? 50,
    },
    roast,
    compliment,
    response_count: responseCount,
  }
}

/**
 * Gets the top 4 scores for the Social Identity Card
 */
export function getCardScores(
  scores: Record<string, number>
): { dimension: string; label: string; score: number }[] {
  return getTopDimensions(scores, 4).map(dim => ({
    dimension: dim,
    label: dim.charAt(0).toUpperCase() + dim.slice(1),
    score: scores[dim] ?? 0,
  }))
}
