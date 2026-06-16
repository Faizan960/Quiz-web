import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { hashPin } from '@/lib/utils/pin'
import { CreateProfileSchema } from '@/lib/utils/validate'
import { handleApiError, ValidationError, ConflictError } from '@/lib/monitoring/errors'

export const dynamic = 'force-dynamic'

/**
 * POST /api/profiles
 * Create a new user profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request using Zod
    const parsedInput = CreateProfileSchema.safeParse(body)
    if (!parsedInput.success) {
      const firstError = parsedInput.error.issues[0]?.message
      throw new ValidationError(firstError || 'Invalid input data')
    }

    const { username, displayName, pin, interests } = parsedInput.data
    const supabase = createAdminClient()

    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from('sm_profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (checkError) {
      throw new Error(`Database error checking username: ${checkError.message}`)
    }
    if (existingUser) {
      throw new ConflictError('This username is already taken')
    }

    // Hash the PIN
    const hashedPin = await hashPin(pin)

    // Insert new profile
    const { data: newProfile, error: insertError } = await supabase
      .from('sm_profiles')
      .insert({
        username,
        display_name: displayName,
        pin_hash: hashedPin,
        interests,
      })
      .select('username', 'display_name')
      .single()

    if (insertError || !newProfile) {
      throw new Error(`Failed to insert profile: ${insertError?.message}`)
    }

    const origin = request.nextUrl.origin

    return NextResponse.json(
      {
        username: newProfile.username,
        displayName: newProfile.display_name,
        shareUrl: `${origin}/${newProfile.username}`,
      },
      { status: 201 }
    )
  } catch (err) {
    return handleApiError(err)
  }
}

/**
 * GET /api/profiles?username=xxx
 * Retrieve public safe profile info (no PIN hash)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      throw new ValidationError('Username parameter is required')
    }

    const supabase = createAdminClient()
    const { data: profile, error } = await supabase
      .from('sm_profiles')
      .select('id, username, display_name, interests, archetype, archetype_updated_at, is_suspended, created_at')
      .eq('username', username.toLowerCase())
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.is_suspended) {
      return NextResponse.json({ error: 'Profile has been suspended' }, { status: 403 })
    }

    return NextResponse.json(profile)
  } catch (err) {
    return handleApiError(err)
  }
}
