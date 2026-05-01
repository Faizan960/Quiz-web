import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/users
export async function GET(request: NextRequest) {
  const err = requireAdmin(request)
  if (err) return err

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, total_quizzes, total_plays, is_banned, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data })
}

// PATCH /api/admin/users — ban/unban
export async function PATCH(request: NextRequest) {
  const err = requireAdmin(request)
  if (err) return err

  const { user_id, action } = await request.json()
  const is_banned = action === 'ban'

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_banned })
    .eq('id', user_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
