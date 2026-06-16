import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/utils/token'
import { classifyArchetype } from '@/lib/engine/archetype'
import { generateInsights } from '@/lib/engine/insights'
import { handleApiError, ValidationError, ForbiddenError, NotFoundError } from '@/lib/monitoring/errors'
import { DimensionKey, DimensionScores } from '@/types/quiz'

interface PageParams {
  params: Promise<{ username: string }>
}

export const dynamic = 'force-dynamic'

/**
 * GET /api/profiles/[username]/report?token=xxx
 * Retrieve PIN-protected personality radar report and response timeline
 */
export async function GET(request: NextRequest, { params }: PageParams) {
  try {
    const { username } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      throw new ValidationError('Authentication token is required')
    }

    // 1. Verify token
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'quizly-jwt-secret'
    const payload = verifyJWT(token, secret)

    if (!payload || payload.username !== username.toLowerCase()) {
      throw new ForbiddenError('Access denied: Invalid or expired token')
    }

    const supabase = createAdminClient()

    // 2. Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('sm_profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (profileError) {
      throw new Error(`Database error fetching profile: ${profileError.message}`)
    }
    if (!profile) {
      throw new NotFoundError('Profile not found')
    }
    if (profile.is_suspended) {
      return NextResponse.json({ error: 'This profile is suspended' }, { status: 403 })
    }

    // 3. Fetch responses
    const { data: responses, error: responsesError } = await supabase
      .from('sm_responses')
      .select('id, completed_at, overall_score, dimension_scores, answers')
      .eq('profile_id', profile.id)
      .order('completed_at', { ascending: false })

    if (responsesError) {
      throw new Error(`Database error fetching responses: ${responsesError.message}`)
    }

    const responseCount = responses?.length || 0

    // Set default scores
    const defaultScores: DimensionScores = {
      charisma: 50,
      resilience: 50,
      loyalty: 50,
      innovation: 50,
      confidence: 50,
      warmth: 50,
      wit: 50,
    }

    const responseData = (responses || []) as unknown as {
      id: string
      completed_at: string
      overall_score: number
      dimension_scores: Record<DimensionKey, number>
      answers: Record<string, string>
    }[]

    // If less than 3 responses, return locked report data
    if (responseCount < 3) {
      return NextResponse.json({
        scores: defaultScores,
        archetype: null,
        insights: [],
        responseCount,
        responses: responseData.map((r) => ({
          id: r.id,
          completed_at: r.completed_at,
          overall_score: r.overall_score,
          // Hide detailed scores and answers for locked reports to prevent reverse engineering
          dimension_scores: defaultScores,
          answers: {},
        })),
      })
    }

    // 4. Calculate averages across all dimension scores
    const totals: Record<DimensionKey, number> = {
      charisma: 0,
      resilience: 0,
      loyalty: 0,
      innovation: 0,
      confidence: 0,
      warmth: 0,
      wit: 0,
    }

    responseData.forEach((resp) => {
      const scores = resp.dimension_scores
      Object.keys(totals).forEach((key) => {
        totals[key as DimensionKey] += scores[key as DimensionKey] ?? 50
      })
    })

    const averageScores = {} as DimensionScores
    Object.keys(totals).forEach((key) => {
      averageScores[key as DimensionKey] = Math.round(totals[key as DimensionKey] / responseCount)
    })

    // 5. Run classification engine
    const archetype = classifyArchetype(averageScores)
    const insights = generateInsights(averageScores, archetype)

    return NextResponse.json({
      scores: averageScores,
      archetype: {
        id: archetype.id,
        name: archetype.name,
        description: archetype.description,
        roast: archetype.roast,
      },
      insights,
      responseCount,
      responses,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
