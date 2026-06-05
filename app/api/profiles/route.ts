import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { getQuestionsForProfile } from '@/lib/engine/questions'
import type { CreateProfilePayload, QuestionCategory } from '@/types/social-mirror'
import { handleApiError, DatabaseError, ValidationError } from '@/lib/monitoring/logger'

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 30)
  const safeBase = base || 'user'
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${safeBase}-${suffix}`
}

// POST /api/profiles — create a new profile + generate questions
export async function POST(request: NextRequest) {
  try {
    const body: CreateProfilePayload = await request.json()
    const { display_name, bio, interests, pin, categories } = body

    if (!display_name?.trim() || !pin?.trim()) {
      throw new ValidationError('Name and PIN are required')
    }
    if (pin.length < 4) {
      throw new ValidationError('PIN must be at least 4 characters')
    }
    if (!categories?.length) {
      throw new ValidationError('Select at least one category')
    }

    const supabase = createAdminClient()
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
      throw new DatabaseError(profileError?.message ?? 'Failed to create profile', profileError)
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
      throw new DatabaseError(questionsError.message, questionsError)
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
    return handleApiError(err, request)
  }
}

// GET /api/profiles?slug=xxx — get public profile info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      throw new ValidationError('slug is required')
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('sm_profiles')
      .select('id, slug, display_name, bio, avatar_url, interests, total_responses, created_at')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      if (error && error.code !== 'PGRST116') {
        throw new DatabaseError(error.message, error)
      }
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile: data })
  } catch (err) {
    return handleApiError(err, request)
  }
}
