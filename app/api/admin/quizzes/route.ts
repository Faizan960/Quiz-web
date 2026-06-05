import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { handleApiError, ValidationError, DatabaseError } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    const err = requireAdmin(request)
    if (err) return err

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('quizzes')
      .select('id, slug, title, category, creator_name, total_plays, is_reported, is_banned, is_featured, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      throw new DatabaseError(error.message, error)
    }
    return NextResponse.json({ quizzes: data })
  } catch (err) {
    return handleApiError(err, request)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const err = requireAdmin(request)
    if (err) return err

    const { quiz_id, action } = await request.json()
    const actionMap: { [key: string]: { [key: string]: boolean } } = {
      ban:       { is_banned: true },
      unban:     { is_banned: false },
      feature:   { is_featured: true },
      unfeature: { is_featured: false },
    }
    const updates = actionMap[action]
    if (!updates) {
      throw new ValidationError('Invalid action')
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('quizzes').update(updates).eq('id', quiz_id)

    if (error) {
      throw new DatabaseError(error.message, error)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err, request)
  }
}
