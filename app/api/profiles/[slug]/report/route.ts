import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { generateReport } from '@/lib/engine/analyzer'
import type { SmQuestion, SmAnswer, ReportType } from '@/types/social-mirror'

const MIN_RESPONSES_FOR_REPORT = 3

// POST /api/profiles/[slug]/report — generate or retrieve report (PIN required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { pin, report_type = 'standard' } = body as { pin: string; report_type?: ReportType }

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required to view your report' }, { status: 401 })
    }

    const supabase = await createClient()

    // 1. Get profile with pin hash
    const { data: profile, error: profileError } = await supabase
      .from('sm_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 2. Verify PIN
    const pinValid = await bcrypt.compare(pin, profile.pin_hash)
    if (!pinValid) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 })
    }

    // 3. Check minimum responses
    if (profile.total_responses < MIN_RESPONSES_FOR_REPORT) {
      return NextResponse.json({
        error: `Need at least ${MIN_RESPONSES_FOR_REPORT} responses to generate a report`,
        current: profile.total_responses,
        required: MIN_RESPONSES_FOR_REPORT,
      }, { status: 400 })
    }

    // 4. Check for cached report
    const { data: cachedReport } = await supabase
      .from('sm_reports')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('report_type', report_type)
      .single()

    if (cachedReport) {
      return NextResponse.json({ report: cachedReport.report_data, cached: true })
    }

    // 5. Fetch all questions and answers for analysis
    const { data: questions } = await supabase
      .from('sm_questions')
      .select('*')
      .eq('profile_id', profile.id)

    const { data: responses } = await supabase
      .from('sm_responses')
      .select('id')
      .eq('profile_id', profile.id)

    const responseIds = (responses ?? []).map(r => r.id)

    let allAnswers: SmAnswer[] = []
    if (responseIds.length > 0) {
      const { data: answers } = await supabase
        .from('sm_answers')
        .select('*')
        .in('response_id', responseIds)

      allAnswers = (answers ?? []) as SmAnswer[]
    }

    // 6. Run our analysis engine
    const reportData = generateReport(
      profile.display_name,
      (questions ?? []) as SmQuestion[],
      allAnswers,
      profile.total_responses
    )

    // 7. Cache the report
    await supabase
      .from('sm_reports')
      .insert({
        profile_id: profile.id,
        report_type: report_type,
        report_data: reportData,
        response_count: profile.total_responses,
      })

    return NextResponse.json({ report: reportData, cached: false })

  } catch (err) {
    console.error('Report generation error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
