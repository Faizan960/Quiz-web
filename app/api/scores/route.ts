import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, ValidationError, DatabaseError } from '@/lib/monitoring/logger'

// POST /api/scores — submit a quiz attempt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quiz_id, player_name, score, total, time_taken_sec } = body

    if (!quiz_id || !player_name || score === undefined || !total) {
      throw new ValidationError('Missing fields')
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('attempts')
      .insert({ quiz_id, player_name, score, total, time_taken_sec: time_taken_sec ?? null })
      .select()
      .single()

    if (error) {
      throw new DatabaseError(error.message, error)
    }
    return NextResponse.json({ attempt: data }, { status: 201 })
  } catch (err) {
    return handleApiError(err, request)
  }
}

// GET /api/scores?quiz_id=xxx — get leaderboard (top 15, sorted by score desc then time asc)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const quiz_id = searchParams.get('quiz_id')

    if (!quiz_id) {
      throw new ValidationError('quiz_id required')
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('attempts')
      .select('player_name, score, total, time_taken_sec, created_at')
      .eq('quiz_id', quiz_id)
      .order('score', { ascending: false })
      .order('time_taken_sec', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(15)

    if (error) {
      throw new DatabaseError(error.message, error)
    }
    return NextResponse.json({ leaderboard: data })
  } catch (err) {
    return handleApiError(err, request)
  }
}
