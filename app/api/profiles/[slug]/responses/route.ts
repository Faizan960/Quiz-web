import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import type { SubmitResponsePayload } from '@/types/social-mirror'
import { handleApiError, ValidationError, AuthenticationError, DatabaseError } from '@/lib/monitoring/logger'

// POST /api/profiles/[slug]/responses — submit friend responses
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body: SubmitResponsePayload = await request.json()
    const { respondent_name, is_anonymous, answers } = body

    if (!answers?.length) {
      throw new ValidationError('No answers provided')
    }

    const supabase = createAdminClient()

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('sm_profiles')
      .select('id, is_active')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (profileError || !profile) {
      if (profileError && profileError.code !== 'PGRST116') {
        throw new DatabaseError(profileError.message, profileError)
      }
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Validate that all submitted question_ids belong to this profile
    const { data: validQuestions, error: qErr } = await supabase
      .from('sm_questions')
      .select('id')
      .eq('profile_id', profile.id)

    if (qErr) {
      throw new DatabaseError(qErr.message, qErr)
    }

    const validIds = new Set((validQuestions ?? []).map((q: { id: string }) => q.id))
    if (answers.some(a => !validIds.has(a.question_id))) {
      throw new ValidationError('Invalid question_id in answers')
    }

    // Create response session
    const sessionId = uuidv4()
    const { data: response, error: responseError } = await supabase
      .from('sm_responses')
      .insert({
        profile_id: profile.id,
        respondent_name: is_anonymous ? null : respondent_name?.trim() || null,
        is_anonymous: is_anonymous ?? true,
        session_id: sessionId,
      })
      .select()
      .single()

    if (responseError || !response) {
      throw new DatabaseError(responseError?.message ?? 'Failed to save response', responseError)
    }

    // Insert individual answers
    const answerRows = answers.map(a => ({
      response_id: response.id,
      question_id: a.question_id,
      answer_value: a.answer_value,
      answer_index: a.answer_index ?? null,
    }))

    const { error: answersError } = await supabase
      .from('sm_answers')
      .insert(answerRows)

    if (answersError) {
      throw new DatabaseError(answersError.message, answersError)
    }

    // Invalidate cached reports (since new data came in)
    await supabase
      .from('sm_reports')
      .delete()
      .eq('profile_id', profile.id)

    return NextResponse.json({
      success: true,
      session_id: sessionId,
    }, { status: 201 })

  } catch (err) {
    return handleApiError(err, request)
  }
}

// GET /api/profiles/[slug]/responses — get responses count publicly, details PIN-gated
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const pin = request.nextUrl.searchParams.get('pin')
    const supabase = createAdminClient()

    const { data: profile, error: profileError } = await supabase
      .from('sm_profiles')
      .select('id, total_responses, pin_hash')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (profileError || !profile) {
      if (profileError && profileError.code !== 'PGRST116') {
        throw new DatabaseError(profileError.message, profileError)
      }
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // If no PIN provided, return only the total count (safe)
    if (!pin) {
      return NextResponse.json({
        total: profile.total_responses,
        responses: [],
      })
    }

    // Verify PIN
    const bcrypt = (await import('bcryptjs')).default
    if (!(await bcrypt.compare(pin, profile.pin_hash))) {
      throw new AuthenticationError('Incorrect PIN')
    }

    // Get response details (PIN verified)
    const { data: responses, error: responsesError } = await supabase
      .from('sm_responses')
      .select('id, respondent_name, is_anonymous, created_at')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })

    if (responsesError) {
      throw new DatabaseError(responsesError.message, responsesError)
    }

    return NextResponse.json({
      total: profile.total_responses,
      responses: responses ?? [],
    })
  } catch (err) {
    return handleApiError(err, request)
  }
}
