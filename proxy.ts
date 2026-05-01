import { NextRequest, NextResponse } from 'next/server'

/**
 * proxy.ts — Next.js 16 Proxy (formerly middleware)
 *
 * Responsibilities:
 * 1. Add security response headers to every response
 * 2. Prevent robots from indexing admin & API routes
 * 3. Ensure API responses skip CDN caching unless explicitly set
 */

const ADMIN_PATHS = ['/admin']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  const isApiRoute = pathname.startsWith('/api/')

  // Build pass-through response
  const response = NextResponse.next()

  // ── Security headers ────────────────────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // ── Robot hints ─────────────────────────────────────────────────────────
  if (isAdminRoute || isApiRoute) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  // ── Prevent accidental CDN caching of API responses ─────────────────────
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
