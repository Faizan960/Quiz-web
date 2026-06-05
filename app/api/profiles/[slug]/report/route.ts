import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { generateReport } from '@/lib/engine/analyzer'
import type { SmQuestion, SmAnswer, ReportType } from '@/types/social-mirror'
import { handleApiError, ValidationError, AuthenticationError, DatabaseError } from '@/lib/monitoring/logger'

const MIN_RESPONSES_FOR_REPORT = 3

// POST /api/profiles/[slug]/report — generate or retrieve report (PIN required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { pin, report_type = 'standard', regenerate = false } = body as { pin: string; report_type?: ReportType; regenerate?: boolean }

    if (!pin) {
      throw new ValidationError('PIN is required to view your report')
    }

    const supabase = createAdminClient()

    // 1. Get profile with pin hash AND interests
    const { data: profile, error: profileError } = await supabase
      .from('sm_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (profileError || !profile) {
      if (profileError && profileError.code !== 'PGRST116') {
        throw new DatabaseError(profileError.message, profileError)
      }
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 2. Verify PIN
    const pinValid = await bcrypt.compare(pin, profile.pin_hash)
    if (!pinValid) {
      throw new AuthenticationError('Incorrect PIN')
    }

    // 3. Check minimum responses
    if (profile.total_responses < MIN_RESPONSES_FOR_REPORT) {
      throw new ValidationError(`Need at least ${MIN_RESPONSES_FOR_REPORT} responses to generate a report`, {
        current: String(profile.total_responses),
        required: String(MIN_RESPONSES_FOR_REPORT),
      })
    }

    // 4. Check for cached report
    if (!regenerate) {
      const { data: cachedReport, error: cacheFetchError } = await supabase
        .from('sm_reports')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('report_type', report_type)
        .maybeSingle()

      if (cacheFetchError) {
        throw new DatabaseError(cacheFetchError.message, cacheFetchError)
      }

      if (cachedReport) {
        return NextResponse.json({ report: cachedReport.report_data, cached: true })
      }
    } else {
      // Clear cached report of this type
      const { error: deleteError } = await supabase
        .from('sm_reports')
        .delete()
        .eq('profile_id', profile.id)
        .eq('report_type', report_type)

      if (deleteError) {
        throw new DatabaseError(deleteError.message, deleteError)
      }
    }

    // 5. Fetch all questions and answers for analysis
    const { data: questions, error: questionsError } = await supabase
      .from('sm_questions')
      .select('*')
      .eq('profile_id', profile.id)

    if (questionsError) {
      throw new DatabaseError(questionsError.message, questionsError)
    }

    const { data: responses, error: responsesError } = await supabase
      .from('sm_responses')
      .select('id')
      .eq('profile_id', profile.id)

    if (responsesError) {
      throw new DatabaseError(responsesError.message, responsesError)
    }

    const responseIds = (responses ?? []).map((r: { id: string }) => r.id)

    let allAnswers: SmAnswer[] = []
    if (responseIds.length > 0) {
      const { data: answers, error: answersError } = await supabase
        .from('sm_answers')
        .select('*')
        .in('response_id', responseIds)

      if (answersError) {
        throw new DatabaseError(answersError.message, answersError)
      }

      allAnswers = (answers ?? []) as SmAnswer[]
    }

    // 6. Run our analysis engine — now with interests!
    const reportData = generateReport(
      profile.display_name,
      (questions ?? []) as SmQuestion[],
      allAnswers,
      profile.total_responses,
      profile.interests ?? []  // Pass user interests to the generator
    )

    // 7. Cache the report
    const { error: cacheInsertError } = await supabase
      .from('sm_reports')
      .insert({
        profile_id: profile.id,
        report_type: report_type,
        report_data: reportData,
        response_count: profile.total_responses,
      })

    if (cacheInsertError) {
      throw new DatabaseError(cacheInsertError.message, cacheInsertError)
    }

    return NextResponse.json({ report: reportData, cached: false })

  } catch (err) {
    return handleApiError(err, request)
  }
}
