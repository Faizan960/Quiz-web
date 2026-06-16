import { NextRequest, NextResponse } from 'next/server'
import { validateAdminPassword } from '@/lib/admin-auth'
import { AdminLoginSchema } from '@/lib/utils/validate'
import { handleApiError, ValidationError, AuthError } from '@/lib/monitoring/errors'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/auth
 * Login as admin using password, returns admin secret token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const parsedInput = AdminLoginSchema.safeParse(body)
    if (!parsedInput.success) {
      const issues = parsedInput.error.format()
      const firstError = Object.values(issues).find((v: any) => v && v._errors)?._errors?.[0]
      throw new ValidationError(firstError || 'Invalid input data')
    }

    const { password } = parsedInput.data

    // Validate password
    const isValid = validateAdminPassword(password)
    if (!isValid) {
      throw new AuthError('Incorrect admin password')
    }

    const token = process.env.ADMIN_SECRET_TOKEN || 'fallback-admin-token'

    return NextResponse.json({ token })
  } catch (err) {
    return handleApiError(err)
  }
}
