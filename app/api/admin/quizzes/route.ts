import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const err = requireAdmin(request)
  if (err) return err
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, slug, title, category, creator_name, total_plays, is_reported, is_banned, is_featured, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ quizzes: data })
}

export async function PATCH(request: NextRequest) {
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
  if (!updates) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  const supabase = createAdminClient()
  const { error } = await supabase.from('quizzes').update(updates).eq('id', quiz_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
