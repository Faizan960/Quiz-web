import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { getQuestionsForProfile } from '@/lib/engine/questions'
import type { CreateProfilePayload, QuestionCategory } from '@/types/social-mirror'

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 30)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

// POST /api/profiles — create a new profile + generate questions
export async function POST(request: NextRequest) {
  try {
    const body: CreateProfilePayload = await request.json()
    const { display_name, bio, interests, pin, categories } = body

    if (!display_name?.trim() || !pin?.trim()) {
      return NextResponse.json({ error: 'Name and PIN are required' }, { status: 400 })
    }
    if (pin.length < 4) {
      return NextResponse.json({ error: 'PIN must be at least 4 characters' }, { status: 400 })
    }
    if (!categories?.length) {
      return NextResponse.json({ error: 'Select at least one category' }, { status: 400 })
    }

    const supabase = await createClient()
    const slug = generateSlug(display_name)
    const pinHash = await bcrypt.hash(pin, 10)

    // 1. Create profile
    const { data: profile, error: profileError } = await supabase
      .from('sm_profiles')
      .insert({
        slug,
        display_name: display_name.trim(),
        bio: bio?.trim() || null,
        interests: interests ?? [],
        pin_hash: pinHash,
      })
      .select()
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: profileError?.message ?? 'Failed to create profile' }, { status: 500 })
    }

    // 2. Generate questions using our engine
    const questionTemplates = getQuestionsForProfile(display_name.trim(), categories as QuestionCategory[], 12)

    const questionRows = questionTemplates.map((q, i) => ({
      profile_id: profile.id,
      question_text: q.text,
      question_type: 'multiple_choice' as const,
      category: q.category,
      options: q.options,
      order_num: i,
    }))

    const { error: questionsError } = await supabase
      .from('sm_questions')
      .insert(questionRows)

    if (questionsError) {
      // Clean up profile if questions fail
      await supabase.from('sm_profiles').delete().eq('id', profile.id)
      return NextResponse.json({ error: questionsError.message }, { status: 500 })
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        slug: profile.slug,
        display_name: profile.display_name,
      },
      slug: profile.slug,
      url: `/${profile.slug}`,
    }, { status: 201 })

  } catch (err) {
    console.error('Profile creation error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET /api/profiles?slug=xxx — get public profile info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sm_profiles')
    .select('id, slug, display_name, bio, avatar_url, interests, total_responses, created_at')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({ profile: data })
}
