// ─────────────────────────────────────────────────
// Quizly — Error Classes & Logging
// ─────────────────────────────────────────────────

import { NextResponse } from 'next/server'

// ─── Error Classes ─────────────────────────────

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, context)
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', 500, context)
    this.name = 'DatabaseError'
  }
}

export class AuthError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', 401, context)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'FORBIDDEN', 403, context)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'NOT_FOUND', 404, context)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, context)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(
    message = 'Too many requests. Please try again later.',
    public readonly resetAt?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'RATE_LIMITED', 429, context)
    this.name = 'RateLimitError'
  }
}

// ─── Logging ───────────────────────────────────

interface LogContext {
  path?: string
  method?: string
  ip?: string
  [key: string]: unknown
}

export function logError(error: unknown, context?: LogContext): void {
  const timestamp = new Date().toISOString()
  const errorObj = error instanceof Error ? error : new Error(String(error))

  console.error(JSON.stringify({
    timestamp,
    level: 'error',
    message: errorObj.message,
    name: errorObj.name,
    code: error instanceof AppError ? error.code : 'UNKNOWN',
    ...context,
    // Never log stack traces in production
    ...(process.env.NODE_ENV !== 'production' && { stack: errorObj.stack }),
  }))
}

export function logInfo(message: string, context?: LogContext): void {
  console.info(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message,
    ...context,
  }))
}

// ─── API Error Handler ─────────────────────────

/**
 * Convert any error into a safe API response.
 * Never exposes stack traces or internal details to the client.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    logError(error)
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  // Unknown errors — log full details, return generic message
  logError(error)
  return NextResponse.json(
    { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}
