// ─────────────────────────────────────────────────
// Quizly — PIN Hashing & Verification
// Uses bcrypt with 12 salt rounds
// ─────────────────────────────────────────────────

import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Hash a 4-digit PIN using bcrypt.
 * @throws if PIN is not exactly 4 digits
 */
export async function hashPin(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits')
  }
  return bcrypt.hash(pin, SALT_ROUNDS)
}

/**
 * Verify a PIN against a bcrypt hash.
 * Returns true if PIN matches the hash.
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) return false
  return bcrypt.compare(pin, hash)
}
