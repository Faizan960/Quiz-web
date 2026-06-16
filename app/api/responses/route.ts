import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { selectQuestionsForProfile } from '@/lib/engine/questions'
import { calculateDimensionScores, calculateOverallScore } from '@/lib/engine/scoring'
import { classifyArchetype } from '@/lib/engine/archetype'
import { handleApiError, ValidationError } from '@/lib/monitoring/errors'
import { AnswerKey, DimensionKey } from '@/types/quiz'

export const dynamic = 'force-dynamic'

/**
 * GET /api/responses?profileId=xxx&token=yyy
 * Returns 10 selected questions for a profile
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    const token = searchParams.get('token')

    if (!profileId || !token) {
      throw new ValidationError('profileId and token parameters are required')
    }

    const supabase = createAdminClient()
    
    // Fetch profile interests first
    const { data: profile, error: profileError } = await supabase
      .from('sm_profiles')
      .select('interests')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Run question selection algorithm
    const questions = await selectQuestionsForProfile(
      profileId,
      profile.interests || [],
      token
    )

    return NextResponse.json({ questions })
  } catch (err) {
    return handleApiError(err)
  }
}

/**
 * POST /api/responses
 * Submit a completed questionnaire response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profile_id, respondent_token, answers } = body as {
      profile_id: string
      respondent_token: string
      answers: Record<string, AnswerKey>
    }

    if (!profile_id || !respondent_token || !answers || Object.keys(answers).length === 0) {
      throw new ValidationError('profile_id, respondent_token, and answers are required')
    }

    const supabase = createAdminClient()

    // 1. Fetch the dimensions for the submitted questions
    const questionIds = Object.keys(answers)
    const { data: dbQuestions, error: qError } = await supabase
      .from('sm_questions')
      .select('id, dimension')
      .in('id', questionIds)

    if (qError || !dbQuestions || dbQuestions.length === 0) {
      throw new Error(`Failed to load questions for scoring: ${qError?.message}`)
    }

    const questionsData = dbQuestions as { id: string; dimension: string }[]

    // 2. Score the dimensions and overall index
    const dimensionScores = calculateDimensionScores(
      answers,
      questionsData.map((q) => ({ id: q.id, dimension: q.dimension as DimensionKey }))
    )
    const overallScore = calculateOverallScore(dimensionScores)

    // 3. Save the response
    const { error: responseInsertError } = await supabase
      .from('sm_responses')
      .insert({
        profile_id,
        respondent_token,
        answers,
        dimension_scores: dimensionScores,
        overall_score: overallScore,
      })

    if (responseInsertError) {
      throw new Error(`Failed to save response: ${responseInsertError.message}`)
    }

    // 4. Update the questions play count
    await Promise.all(
      questionIds.map((qId) =>
        supabase.rpc('increment_play_count', { p_trivia_id: qId })
      )
    )

    // 5. Query all responses for this profile to recompute the aggregate archetype
    const { data: allResponses, error: responsesFetchError } = await supabase
      .from('sm_responses')
      .select('dimension_scores')
      .eq('profile_id', profile_id)

    if (!responsesFetchError && allResponses && allResponses.length > 0) {
      // Calculate averages across all responses
      const totals: Record<DimensionKey, number> = {
        charisma: 0,
        resilience: 0,
        loyalty: 0,
        innovation: 0,
        confidence: 0,
        warmth: 0,
        wit: 0,
      }
      
      const responsesData = allResponses as unknown as { dimension_scores: Record<DimensionKey, number> }[]
      responsesData.forEach((resp) => {
        const scores = resp.dimension_scores
        Object.keys(totals).forEach((key) => {
          totals[key as DimensionKey] += scores[key as DimensionKey] ?? 50
        })
      })

      const count = allResponses.length
      const averages = {} as Record<DimensionKey, number>
      Object.keys(totals).forEach((key) => {
        averages[key as DimensionKey] = Math.round(totals[key as DimensionKey] / count)
      })

      // Classify the new archetype
      const newArchetype = classifyArchetype(averages)

      // Update in profile
      await supabase
        .from('sm_profiles')
        .update({
          archetype: newArchetype.name,
          archetype_updated_at: new Date().toISOString(),
        })
        .eq('id', profile_id)
    }

    return NextResponse.json({ success: true, overallScore })
  } catch (err) {
    return handleApiError(err)
  }
}
