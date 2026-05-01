import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/ads — get current ad settings
export async function GET(request: NextRequest) {
  const err = requireAdmin(request)
  if (err) return err

  const supabase = createAdminClient()
  const { data, error } = await supabase.from('ad_settings').select('*').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ads: data })
}

// PUT /api/admin/ads — update ad settings
export async function PUT(request: NextRequest) {
  const err = requireAdmin(request)
  if (err) return err

  const body = await request.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ad_settings')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ads: data })
}
