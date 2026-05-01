import { NextRequest, NextResponse } from 'next/server'
import { validateAdminPassword } from '@/lib/admin-auth'

// POST /api/admin/login
export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!validateAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  // Return the admin token (in real app, use httpOnly cookie)
  return NextResponse.json({
    token: process.env.ADMIN_SECRET_TOKEN,
    message: 'Logged in successfully'
  })
}
