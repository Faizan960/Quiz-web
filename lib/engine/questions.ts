// ─────────────────────────────────────────────────
// Quizly — Question Selection Algorithm
// ─────────────────────────────────────────────────

import type { Question, DimensionKey } from '@/types/quiz'
import { DIMENSION_KEYS } from '@/types/quiz'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Select 10 questions for a given profile.
 *
 * Algorithm:
 * 1. Fetch all active, non-banned questions
 * 2. Filter out questions already answered by this respondent
 * 3. Ensure at least 1 question per dimension (7 covered)
 * 4. Fill remaining 3 from questions matching profile's interests
 * 5. If not enough interest-matches, fill randomly
 * 6. Shuffle the final 10
 */
export async function selectQuestionsForProfile(
  profileId: string,
  interests: string[],
  respondentToken: string
): Promise<Question[]> {
  const supabase = createAdminClient()

  // 1. Get all active questions
  const { data: allQuestions, error: qError } = await supabase
    .from('sm_questions')
    .select('*')
    .eq('is_active', true)
    .eq('is_banned', false)

  if (qError || !allQuestions) {
    throw new Error(`Failed to fetch questions: ${qError?.message}`)
  }

  // 2. Get previously answered question IDs for this respondent + profile
  const { data: existingResponses } = await supabase
    .from('sm_responses')
    .select('answers')
    .eq('profile_id', profileId)
    .eq('respondent_token', respondentToken)

  const answeredQuestionIds = new Set<string>()
  if (existingResponses) {
    for (const response of existingResponses) {
      const answers = response.answers as Record<string, string>
      for (const qId of Object.keys(answers)) {
        answeredQuestionIds.add(qId)
      }
    }
  }

  // 3. Filter to available questions
  const available = (allQuestions as Question[]).filter(
    (q) => !answeredQuestionIds.has(q.id)
  )

  if (available.length < 10) {
    // If not enough fresh questions, allow repeats but still shuffle
    return shuffleArray(allQuestions as Question[]).slice(0, 10)
  }

  // 4. Pick one per dimension
  const selected: Question[] = []
  const usedIds = new Set<string>()
  const byDimension = new Map<DimensionKey, Question[]>()

  for (const dim of DIMENSION_KEYS) {
    byDimension.set(dim, [])
  }
  for (const q of available) {
    const dim = q.dimension as DimensionKey
    if (DIMENSION_KEYS.includes(dim)) {
      byDimension.get(dim)!.push(q)
    }
  }

  // One per dimension (7 questions)
  for (const dim of DIMENSION_KEYS) {
    const pool = byDimension.get(dim) || []
    if (pool.length > 0) {
      const pick = pool[Math.floor(Math.random() * pool.length)]
      selected.push(pick)
      usedIds.add(pick.id)
    }
  }

  // 5. Fill remaining 3 from interest-matched questions
  const remaining = available.filter(
    (q) => !usedIds.has(q.id)
  )

  // Prefer interest-tagged questions
  const interestSet = new Set(interests.map((i) => i.toLowerCase()))
  const interestMatched = remaining.filter((q) =>
    q.interest_tags.some((tag) => interestSet.has(tag.toLowerCase()))
  )

  const filler = shuffleArray(interestMatched)
  for (const q of filler) {
    if (selected.length >= 10) break
    if (!usedIds.has(q.id)) {
      selected.push(q)
      usedIds.add(q.id)
    }
  }

  // 6. If still need more, fill from remaining pool
  const randomFiller = shuffleArray(remaining)
  for (const q of randomFiller) {
    if (selected.length >= 10) break
    if (!usedIds.has(q.id)) {
      selected.push(q)
      usedIds.add(q.id)
    }
  }

  return shuffleArray(selected).slice(0, 10)
}

/**
 * Fisher–Yates shuffle.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
