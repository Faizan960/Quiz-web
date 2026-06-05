import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateQuizPayload } from '@/types/database'
import { handleApiError, ValidationError, DatabaseError } from '@/lib/monitoring/logger'

function generateSlug(title: string, creatorName: string): string {
  const nameSlug = creatorName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 20)
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30)
  const suffix = Math.random().toString(36).slice(2, 7)
  // Prefer: "faizans-quiz-xxxxx" style
  return `${nameSlug}s-${titleSlug}-${suffix}`.replace(/-+/g, '-').slice(0, 70)
}

// POST /api/quizzes — create a new quiz
export async function POST(request: NextRequest) {
  try {
    const body: CreateQuizPayload = await request.json()
    const { title, description, category, creator_name, questions } = body

    if (!title || !category || !questions?.length) {
      throw new ValidationError('Missing required fields')
    }
    if (questions.length < 1 || questions.length > 30) {
      throw new ValidationError('Must have 1–30 questions')
    }

    const supabase = await createClient()
    const slug = generateSlug(title, creator_name || 'user')

    // Insert quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({ slug, title, description: description ?? null, category, creator_name })
      .select()
      .single()

    if (quizError || !quiz) {
      throw new DatabaseError(quizError?.message ?? 'Failed to create quiz', quizError)
    }

    // Insert questions
    const questionRows = questions.map((q, i) => ({
      quiz_id: quiz.id,
      question_text: q.question_text,
      options: q.options,
      correct_index: q.correct_index,
      image_url: q.image_url ?? null,
      order_num: i,
    }))

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionRows)

    if (questionsError) {
      // Clean up quiz if questions insert fail
      await supabase.from('quizzes').delete().eq('id', quiz.id)
      throw new DatabaseError(questionsError.message, questionsError)
    }

    return NextResponse.json({ quiz, slug, url: `/play/${slug}` }, { status: 201 })
  } catch (err) {
    return handleApiError(err, request)
  }
}

// GET /api/quizzes?category=besties&limit=12
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') ?? '12')

    const supabase = await createClient()

    let query = supabase
      .from('quizzes')
      .select('id, slug, title, category, creator_name, total_plays, avg_score, created_at')
      .eq('is_public', true)
      .eq('is_banned', false)
      .order('total_plays', { ascending: false })
      .limit(limit)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) {
      throw new DatabaseError(error.message, error)
    }
    return NextResponse.json({ quizzes: data })
  } catch (err) {
    return handleApiError(err, request)
  }
}
