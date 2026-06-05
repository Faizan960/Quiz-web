import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { handleApiError, DatabaseError } from '@/lib/monitoring/logger'

// GET /api/admin/ads — get current ad settings
export async function GET(request: NextRequest) {
  try {
    const err = requireAdmin(request)
    if (err) return err

    const supabase = createAdminClient()
    const { data, error } = await supabase.from('ad_settings').select('*').single()

    if (error) {
      throw new DatabaseError(error.message, error)
    }
    return NextResponse.json({ ads: data })
  } catch (err) {
    return handleApiError(err, request)
  }
}

// PUT /api/admin/ads — update ad settings
export async function PUT(request: NextRequest) {
  try {
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

    if (error) {
      throw new DatabaseError(error.message, error)
    }
    return NextResponse.json({ ads: data })
  } catch (err) {
    return handleApiError(err, request)
  }
}
