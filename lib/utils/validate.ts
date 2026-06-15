// ─────────────────────────────────────────────────
// Quizly — Input Validation (Zod Schemas)
// ─────────────────────────────────────────────────

import { z } from 'zod'

// ─── Username Blocklist ────────────────────────

const BLOCKED_USERNAMES = new Set([
  'admin', 'administrator', 'root', 'system', 'quizly',
  'api', 'www', 'mail', 'help', 'support', 'create',
  'login', 'signup', 'profile', 'settings', 'dashboard',
  'play', 'report', 'null', 'undefined', 'test', 'demo',
  // Offensive terms (abbreviated list — expand as needed)
  'fuck', 'shit', 'ass', 'dick', 'porn', 'sex', 'nazi',
  'kill', 'hate', 'racist', 'nigger', 'faggot', 'retard',
])

function isBlockedUsername(username: string): boolean {
  return BLOCKED_USERNAMES.has(username.toLowerCase())
}

// ─── Schemas ───────────────────────────────────

export const CreateProfileSchema = z.object({
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{3,24}$/,
      'Username must be 3–24 lowercase letters, numbers, or underscores'
    )
    .refine((v) => !isBlockedUsername(v), {
      message: 'This username is not available',
    }),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be under 50 characters')
    .transform((v) => v.trim()),
  pin: z
    .string()
    .regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
  interests: z
    .array(z.string().min(1).max(30))
    .min(1, 'Select at least 1 interest')
    .max(5, 'Maximum 5 interests allowed'),
})

export const SubmitResponseSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
  answers: z.record(
    z.string().uuid('Invalid question ID'),
    z.enum(['A', 'B', 'C', 'D'], { message: 'Answer must be A, B, C, or D' })
  ),
})

export const VerifyPinSchema = z.object({
  username: z
    .string()
    .min(3, 'Username too short')
    .max(24, 'Username too long'),
  pin: z
    .string()
    .regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
})

export const AdminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

// ─── Type Exports ──────────────────────────────

export type CreateProfileInput = z.infer<typeof CreateProfileSchema>
export type SubmitResponseInput = z.infer<typeof SubmitResponseSchema>
export type VerifyPinInput = z.infer<typeof VerifyPinSchema>
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>
