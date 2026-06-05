import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { handleApiError, DatabaseError } from '@/lib/monitoring/logger'

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const err = requireAdmin(request)
    if (err) return err

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, total_quizzes, total_plays, is_banned, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      throw new DatabaseError(error.message, error)
    }
    return NextResponse.json({ users: data })
  } catch (err) {
    return handleApiError(err, request)
  }
}

// PATCH /api/admin/users — ban/unban
export async function PATCH(request: NextRequest) {
  try {
    const err = requireAdmin(request)
    if (err) return err

    const { user_id, action } = await request.json()
    const is_banned = action === 'ban'

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned })
      .eq('id', user_id)

    if (error) {
      throw new DatabaseError(error.message, error)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err, request)
  }
}
