import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateStoryCard } from '@/lib/card/generator'
import { classifyArchetype } from '@/lib/engine/archetype'
import { handleApiError, NotFoundError } from '@/lib/monitoring/errors'
import { DimensionKey, DimensionScores } from '@/types/quiz'

interface PageParams {
  params: Promise<{ username: string }>
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: PageParams) {
  try {
    const { username } = await params
    const supabase = createAdminClient()

    // 1. Fetch profile
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

    // 2. Fetch responses
    const { data: responses, error: responsesError } = await supabase
      .from('sm_responses')
      .select('dimension_scores')
      .eq('profile_id', profile.id)

    if (responsesError) {
      throw new Error(`Database error fetching responses: ${responsesError.message}`)
    }

    const count = responses?.length || 0

    let archetype = 'Radar Pending... 🪞'
    let roast = `Waiting for responses. Help unlock their profile by rating them anonymously!`
    let scores: DimensionScores = {
      charisma: 50,
      resilience: 50,
      loyalty: 50,
      innovation: 50,
      confidence: 50,
      warmth: 50,
      wit: 50,
    }

    if (count >= 3) {
      const totals: Record<DimensionKey, number> = {
        charisma: 0,
        resilience: 0,
        loyalty: 0,
        innovation: 0,
        confidence: 0,
        warmth: 0,
        wit: 0,
      }

      responses!.forEach((resp) => {
        const s = resp.dimension_scores as Record<DimensionKey, number>
        Object.keys(totals).forEach((key) => {
          totals[key as DimensionKey] += s[key as DimensionKey] ?? 50
        })
      })

      Object.keys(totals).forEach((key) => {
        scores[key as DimensionKey] = Math.round(totals[key as DimensionKey] / count)
      })

      const arcClass = classifyArchetype(scores)
      archetype = arcClass.name
      roast = arcClass.roast
    } else {
      roast = `${profile.display_name} is waiting for ratings. Help unlock their personality profile on Quizly!`
    }

    // 3. Generate OG image (type: 'og')
    const pngBuffer = await generateStoryCard({
      username: profile.username,
      displayName: profile.display_name,
      archetype,
      roast,
      scores,
      type: 'og',
    })

    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
