import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateReport } from '@/lib/engine/analyzer'
import type { SmQuestion, SmAnswer } from '@/types/social-mirror'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createAdminClient()

    const { data: profile, error: profileError } = await supabase
      .from('sm_profiles')
      .select('id, display_name, total_responses, interests')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // If there are no responses or questions, return default/empty state
    if (profile.total_responses === 0) {
      return NextResponse.json({
        total_responses: 0,
        display_name: profile.display_name,
        archetype: null,
        archetype_emoji: null,
      })
    }

    const { data: questions } = await supabase
      .from('sm_questions')
      .select('*')
      .eq('profile_id', profile.id)

    const { data: responses } = await supabase
      .from('sm_responses')
      .select('id')
      .eq('profile_id', profile.id)

    const responseIds = (responses ?? []).map((r: { id: string }) => r.id)

    let allAnswers: SmAnswer[] = []
    if (responseIds.length > 0) {
      const { data: answers } = await supabase
        .from('sm_answers')
        .select('*')
        .in('response_id', responseIds)

      allAnswers = (answers ?? []) as SmAnswer[]
    }

    const reportData = generateReport(
      profile.display_name,
      (questions ?? []) as SmQuestion[],
      allAnswers,
      profile.total_responses,
      profile.interests ?? []
    )

    return NextResponse.json({
      total_responses: profile.total_responses,
      display_name: profile.display_name,
      archetype: reportData.archetype,
      archetype_emoji: reportData.archetype_emoji,
    })

  } catch (err) {
    console.error('Teaser fetch error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
