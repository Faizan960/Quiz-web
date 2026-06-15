// ─────────────────────────────────────────────────
// Quizly — In-Memory Rate Limiter
// Simple sliding-window counter per key
// ─────────────────────────────────────────────────

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check and increment rate limit for a given key.
 *
 * @param key - Unique identifier (e.g., `create:${ip}` or `pin:${username}:${ip}`)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Window duration in milliseconds
 * @returns success=true if under limit, success=false if exceeded
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const existing = store.get(key)

  // If no entry or window expired, create fresh entry
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: maxRequests - 1, resetAt }
  }

  // Window still active
  if (existing.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  return {
    success: true,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt,
  }
}

// ─── Preset Rate Limiters ──────────────────────

const ONE_HOUR = 60 * 60 * 1000
const THIRTY_MINUTES = 30 * 60 * 1000
const FIFTEEN_MINUTES = 15 * 60 * 1000

/** Profile creation: max 3 per IP per hour */
export function rateLimitProfileCreation(ip: string): RateLimitResult {
  return rateLimit(`create:${ip}`, 3, ONE_HOUR)
}

/** Quiz submission: max 5 per IP per hour per profile */
export function rateLimitQuizSubmission(ip: string, profileId: string): RateLimitResult {
  return rateLimit(`quiz:${ip}:${profileId}`, 5, ONE_HOUR)
}

/** PIN attempts: max 3 per username+IP per 30 minutes */
export function rateLimitPinAttempt(username: string, ip: string): RateLimitResult {
  return rateLimit(`pin:${username}:${ip}`, 3, THIRTY_MINUTES)
}

/** Admin login: max 5 per IP per 15 minutes */
export function rateLimitAdminLogin(ip: string): RateLimitResult {
  return rateLimit(`admin:${ip}`, 5, FIFTEEN_MINUTES)
}
