import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyPin } from '@/lib/utils/pin'
import { signJWT } from '@/lib/utils/token'
import { VerifyPinSchema } from '@/lib/utils/validate'
import { handleApiError, ValidationError, AuthError, NotFoundError } from '@/lib/monitoring/errors'

export const dynamic = 'force-dynamic'

/**
 * POST /api/pin
 * Verify username and PIN, return a signed session token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const parsedInput = VerifyPinSchema.safeParse(body)
    if (!parsedInput.success) {
      const firstError = parsedInput.error.issues[0]?.message
      throw new ValidationError(firstError || 'Invalid input data')
    }

    const { username, pin } = parsedInput.data
    const supabase = createAdminClient()

    // Retrieve profile
    const { data: profile, error } = await supabase
      .from('sm_profiles')
      .select('id, username, pin_hash, is_suspended')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (error) {
      throw new Error(`Database error fetching profile: ${error.message}`)
    }
    if (!profile) {
      throw new NotFoundError('Profile not found')
    }
    if (profile.is_suspended) {
      return NextResponse.json({ error: 'This profile is suspended' }, { status: 403 })
    }

    // Verify PIN
    const isValid = await verifyPin(pin, profile.pin_hash)
    if (!isValid) {
      throw new AuthError('Incorrect PIN')
    }

    // Sign a lightweight JWT token (valid for 24 hours)
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!secret) {
      throw new Error('Supabase service role key is not configured')
    }
    const token = signJWT(
      { profileId: profile.id, username: profile.username },
      secret,
      86400 // 24 hours
    )

    return NextResponse.json({
      token,
      username: profile.username,
      profileId: profile.id,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
