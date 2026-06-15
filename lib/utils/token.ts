// ─────────────────────────────────────────────────
// Quizly — Token Generation & JWT
// ─────────────────────────────────────────────────

import { createHmac, createHash, randomBytes, timingSafeEqual } from 'crypto'

/**
 * Generate an anonymous respondent token.
 * SHA-256 of salted IP + user agent + profileId.
 * This ensures the same person can't respond twice,
 * but we never store their IP or UA.
 */
export function generateRespondentToken(
  ip: string,
  userAgent: string,
  profileId: string
): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) || 'quizly-salt-2024'
  const data = `${salt}:${ip}:${userAgent}:${profileId}`
  return createHash('sha256').update(data).digest('hex')
}

// ─── Lightweight JWT Implementation ────────────

interface JWTPayload {
  [key: string]: unknown
  iat?: number
  exp?: number
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data).toString('base64url')
}

function base64UrlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

/**
 * Sign a JWT with HMAC-SHA256.
 */
export function signJWT(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSeconds: number
): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)

  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  }

  const headerEncoded = base64UrlEncode(JSON.stringify(header))
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload))
  const signature = createHmac('sha256', secret)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest('base64url')

  return `${headerEncoded}.${payloadEncoded}.${signature}`
}

/**
 * Verify a JWT and return its payload.
 * Returns null if invalid or expired.
 */
export function verifyJWT(token: string, secret: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerEncoded, payloadEncoded, signatureProvided] = parts

    // Verify signature
    const expectedSignature = createHmac('sha256', secret)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest('base64url')

    const sigBuffer = Buffer.from(signatureProvided, 'base64url')
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url')

    if (sigBuffer.length !== expectedBuffer.length) return null
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null

    // Decode payload
    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadEncoded))

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Generate a cryptographically secure random token.
 */
export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('hex')
}
