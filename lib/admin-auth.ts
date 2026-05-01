import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────
// Validate admin token from request headers
// Usage: const err = requireAdmin(request); if (err) return err;
// ─────────────────────────────────────────────────
export function requireAdmin(request: NextRequest): NextResponse | null {
  const token = request.headers.get('x-admin-token')
  const validToken = process.env.ADMIN_SECRET_TOKEN

  if (!token || token !== validToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// ─────────────────────────────────────────────────
// Login: validate password and return token
// POST /api/admin/login { password }
// ─────────────────────────────────────────────────
export function validateAdminPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD
}
