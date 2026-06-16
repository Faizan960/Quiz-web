import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { handleApiError, ValidationError } from '@/lib/monitoring/errors'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/trivia
 * Returns list of all trivia quizzes (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const authError = requireAdmin(request)
    if (authError) return authError

    const supabase = createAdminClient()
    const { data: trivia, error } = await supabase
      .from('sm_trivia')
      .select('id, slug, title, category, play_count, is_banned, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database error fetching trivia: ${error.message}`)
    }

    return NextResponse.json({ trivia: trivia || [] })
  } catch (err) {
    return handleApiError(err)
  }
}

/**
 * PATCH /api/admin/trivia
 * Toggle banned status of a trivia quiz (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const authError = requireAdmin(request)
    if (authError) return authError

    const body = await request.json()
    const { trivia_id, action } = body as { trivia_id: string; action: 'ban' | 'unban' }

    if (!trivia_id || !action) {
      throw new ValidationError('trivia_id and action are required')
    }

    const isBanned = action === 'ban'
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('sm_trivia')
      .update({ is_banned: isBanned })
      .eq('id', trivia_id)

    if (error) {
      throw new Error(`Database error updating trivia: ${error.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}

/**
 * POST /api/admin/trivia
 * Create a new trivia quiz (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const authError = requireAdmin(request)
    if (authError) return authError

    const body = await request.json()
    const { title, category, questions } = body as {
      title: string
      category: string
      questions: Array<{ question: string; options: string[]; correct_index: number }>
    }

    if (!title || !category || !questions || questions.length === 0) {
      throw new ValidationError('title, category, and questions are required')
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 40) + '-' + Math.random().toString(36).slice(2, 6)

    const supabase = createAdminClient()

    const { data: newTrivia, error } = await supabase
      .from('sm_trivia')
      .insert({
        slug,
        title,
        category,
        questions,
      })
      .select('id, slug, title')
      .single()

    if (error || !newTrivia) {
      throw new Error(`Database error creating trivia: ${error.message}`)
    }

    return NextResponse.json({ success: true, trivia: newTrivia }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
