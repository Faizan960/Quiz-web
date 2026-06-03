import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/profiles/[slug]/questions — get questions for friends to answer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createAdminClient()

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('sm_profiles')
    .select('id, slug, display_name, bio, avatar_url, interests')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Get questions
  const { data: questions, error: questionsError } = await supabase
    .from('sm_questions')
    .select('id, question_text, question_type, category, options, order_num')
    .eq('profile_id', profile.id)
    .order('order_num', { ascending: true })

  if (questionsError) {
    return NextResponse.json({ error: questionsError.message }, { status: 500 })
  }

  return NextResponse.json({
    profile,
    questions: questions ?? [],
  })
}
