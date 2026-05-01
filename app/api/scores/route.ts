import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/scores — submit a quiz attempt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quiz_id, player_name, score, total, time_taken_sec } = body

    if (!quiz_id || !player_name || score === undefined || !total) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('attempts')
      .insert({ quiz_id, player_name, score, total, time_taken_sec: time_taken_sec ?? null })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ attempt: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET /api/scores?quiz_id=xxx — get leaderboard (top 15, sorted by score desc then time asc)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const quiz_id = searchParams.get('quiz_id')

  if (!quiz_id) return NextResponse.json({ error: 'quiz_id required' }, { status: 400 })

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attempts')
    .select('player_name, score, total, time_taken_sec, created_at')
    .eq('quiz_id', quiz_id)
    .order('score', { ascending: false })
    .order('time_taken_sec', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(15)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leaderboard: data })
}
