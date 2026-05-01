import { NextRequest, NextResponse } from 'next/server'

/**
 * Logger - Structured logging for production monitoring
 * 
 * Provides structured JSON logging in production and human-readable
 * logging in development. Supports multiple log levels and request logging.
 * 
 * Requirements:
 * - 6.2: Log errors with timestamp, endpoint, and stack trace
 * - 6.3: Return generic error messages to clients (no internal details)
 * - 6.7: Log all API requests with method, path, status code, and response time
 * - 6.8: Provide structured logging in JSON format for production environments
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: {
    name: string
    message: string
    stack?: string
  }
  request?: {
    method: string
    path: string
    ip?: string
  }
}

export class Logger {
  private isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  /**
   * Log a debug message (development only)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isProduction) return // Skip debug logs in production
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Log an informational message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log an error message with optional Error object
   */
  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    const errorInfo = error
      ? {
          name: error.name,
          message: error.message,
          stack: this.isProduction ? undefined : error.stack,
        }
      : undefined

    this.log(LogLevel.ERROR, message, context, errorInfo)
  }

  /**
   * Log an API request with method, path, status, and duration
   * 
   * Requirement 6.7: Log all API requests with method, path, status code, and response time
   */
  logRequest(
    request: NextRequest,
    response: NextResponse,
    durationMs: number
  ): void {
    const ip = this.getClientIp(request)
    const path = request.nextUrl.pathname
    const method = request.method
    const status = response.status

    this.log(LogLevel.INFO, 'API Request', {
      method,
      path,
      status,
      duration_ms: durationMs,
      ip,
    })
  }

  /**
   * Core logging method that formats and outputs log entries
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: { name: string; message: string; stack?: string },
    request?: { method: string; path: string; ip?: string }
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
      ...(error && { error }),
      ...(request && { request }),
    }

    if (this.isProduction) {
      // Production: JSON format for log aggregation systems
      console.log(JSON.stringify(entry))
    } else {
      // Development: Human-readable format
      this.logHumanReadable(entry)
    }
  }

  /**
   * Format log entry for human-readable console output (development)
   */
  private logHumanReadable(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const levelColors: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    }
    const reset = '\x1b[0m'
    const color = levelColors[entry.level]

    let output = `${color}[${entry.level.toUpperCase()}]${reset} ${timestamp} - ${entry.message}`

    if (entry.context) {
      output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`
      if (entry.error.stack) {
        output += `\n  Stack: ${entry.error.stack}`
      }
    }

    if (entry.request) {
      output += `\n  Request: ${entry.request.method} ${entry.request.path}`
      if (entry.request.ip) {
        output += ` (${entry.request.ip})`
      }
    }

    console.log(output)
  }

  /**
   * Extract client IP address from request headers
   */
  private getClientIp(request: NextRequest): string | undefined {
    // Check common headers for client IP (in order of preference)
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwardedFor.split(',')[0].trim()
    }

    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
      return realIp
    }

    // Fallback to undefined if no IP headers found
    return undefined
  }
}

/**
 * Singleton logger instance for use throughout the application
 * 
 * @example
 * import { logger } from '@/lib/monitoring/logger'
 * 
 * logger.info('User created quiz', { quizId: '123', category: 'science' })
 * logger.error('Database query failed', error, { query: 'SELECT * FROM quizzes' })
 */
export const logger = new Logger()

/**
 * Custom error types for API error handling
 */
export class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, string>) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Too many requests', public retryAfter?: number) {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message)
    this.name = 'DatabaseError'
  }
}

/**
 * API Error Handler - Centralized error handling for API routes
 * 
 * Catches and formats errors, maps them to appropriate HTTP status codes,
 * hides stack traces in production, and logs all errors with full context.
 * 
 * Requirements:
 * - 6.1: Catch unhandled errors in API endpoints
 * - 6.4: Hide internal error details and stack traces from clients
 * - 6.5: Log database errors and return HTTP 500
 * - 6.6: Return HTTP 400 for validation errors with details
 * 
 * @param error - The error to handle (can be any type)
 * @param request - The Next.js request object for context
 * @returns NextResponse with appropriate error message and status code
 * 
 * @example
 * try {
 *   // API logic
 * } catch (error) {
 *   return handleApiError(error, request)
 * }
 */
export function handleApiError(
  error: unknown,
  request: NextRequest
): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production'
  const path = request.nextUrl.pathname
  const method = request.method

  // Validation errors (400)
  if (error instanceof ValidationError) {
    logger.warn('Validation error', {
      path,
      method,
      message: error.message,
      details: error.details,
    })

    return NextResponse.json(
      {
        error: error.message,
        code: 'VALIDATION_ERROR',
        ...(error.details && { details: error.details }),
      },
      { status: 400 }
    )
  }

  // Authentication errors (401)
  if (error instanceof AuthenticationError) {
    logger.warn('Authentication error', {
      path,
      method,
      message: error.message,
    })

    return NextResponse.json(
      {
        error: error.message,
        code: 'AUTH_ERROR',
      },
      { status: 401 }
    )
  }

  // Authorization errors (403)
  if (error instanceof AuthorizationError) {
    logger.warn('Authorization error', {
      path,
      method,
      message: error.message,
    })

    return NextResponse.json(
      {
        error: error.message,
        code: 'FORBIDDEN',
      },
      { status: 403 }
    )
  }

  // Rate limit errors (429)
  if (error instanceof RateLimitError) {
    logger.warn('Rate limit exceeded', {
      path,
      method,
      message: error.message,
      retryAfter: error.retryAfter,
    })

    const response = NextResponse.json(
      {
        error: error.message,
        code: 'RATE_LIMIT_EXCEEDED',
      },
      { status: 429 }
    )

    if (error.retryAfter) {
      response.headers.set('Retry-After', error.retryAfter.toString())
    }

    return response
  }

  // Database errors (500)
  if (error instanceof DatabaseError) {
    logger.error('Database error', error as Error, {
      path,
      method,
      originalError: error.originalError,
    })

    const body: Record<string, unknown> = {
      error: 'Database operation failed',
      code: 'DATABASE_ERROR',
    }
    if (!isProduction && error.originalError) {
      body.details = error.originalError
    }

    return NextResponse.json(body, { status: 500 })
  }

  // Generic Error instances
  if (error instanceof Error) {
    logger.error('Unhandled API error', error, {
      path,
      method,
    })

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'SERVER_ERROR',
        // Only expose stack trace in development
        ...(!isProduction && { details: { message: error.message, stack: error.stack } }),
      },
      { status: 500 }
    )
  }

  // Unknown error types
  logger.error('Unknown error type', undefined, {
    path,
    method,
    error: String(error),
  })

  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'SERVER_ERROR',
      ...(!isProduction && { details: error }),
    },
    { status: 500 }
  )
}
