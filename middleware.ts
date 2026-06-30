import { NextRequest, NextResponse } from 'next/server'

/**
 * middleware.ts — Next.js Middleware
 *
 * Responsibilities:
 * 1. Protect /admin/dashboard routes by verifying admin session cookies
 * 2. Add security response headers to every response
 * 3. Prevent robots from indexing admin & API routes
 * 4. Ensure API responses skip CDN caching unless explicitly set
 */

const ADMIN_PATHS = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Protect admin dashboard routes
  if (pathname.startsWith('/admin/dashboard')) {
    const adminToken = request.cookies.get('quizly_admin_token')?.value
    const expectedToken = process.env.ADMIN_SECRET_TOKEN

    if (!expectedToken || !adminToken || adminToken !== expectedToken) {
      const loginUrl = new URL('/admin', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  const isAdminRoute = ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  const isApiRoute = pathname.startsWith('/api/')

  // Build pass-through response
  const response = NextResponse.next()

  // 2. Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // 3. Robot hints
  if (isAdminRoute || isApiRoute) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  // 4. Prevent accidental CDN caching of API responses
  if (isApiRoute && !response.headers.get('Cache-Control')) {
    response.headers.set('Cache-Control', 'no-store')
  }

  return response
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf)$).*)',
  ],
}
