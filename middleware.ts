import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Only protect /admin/dashboard routes
  if (path.startsWith('/admin/dashboard')) {
    const adminToken = request.cookies.get('quizly_admin_token')?.value
    const expectedToken = process.env.ADMIN_SECRET_TOKEN || 'fallback-admin-token'

    if (!adminToken || adminToken !== expectedToken) {
      // Redirect to admin login page
      const loginUrl = new URL('/admin', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Config to only trigger middleware on specific paths
export const config = {
  matcher: ['/admin/dashboard/:path*'],
}
