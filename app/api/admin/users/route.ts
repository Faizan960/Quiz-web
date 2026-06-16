import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { handleApiError, ValidationError } from '@/lib/monitoring/errors'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/users
 * Returns list of profiles (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const authError = requireAdmin(request)
    if (authError) return authError

    const supabase = createAdminClient()
    
    // Fetch profiles from sm_profiles
    const { data: users, error } = await supabase
      .from('sm_profiles')
      .select('id, username, display_name, interests, archetype, is_suspended, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      throw new Error(`Database error fetching users: ${error.message}`)
    }

    return NextResponse.json({ users: users || [] })
  } catch (err) {
    return handleApiError(err)
  }
}

/**
 * PATCH /api/admin/users
 * Toggle profile suspension (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const authError = requireAdmin(request)
    if (authError) return authError

    const body = await request.json()
    const { user_id, action } = body as { user_id: string; action: 'suspend' | 'unsuspend' | 'ban' | 'unban' }

    if (!user_id || !action) {
      throw new ValidationError('user_id and action are required')
    }

    const isSuspended = action === 'suspend' || action === 'ban'
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('sm_profiles')
      .update({ is_suspended: isSuspended })
      .eq('id', user_id)

    if (error) {
      throw new Error(`Database error updating profile suspension: ${error.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
