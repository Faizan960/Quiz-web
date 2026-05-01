/**
 * Logger Usage Examples for API Routes
 * 
 * This file demonstrates how to integrate the Logger into Next.js API routes.
 * Copy these patterns into your actual API route handlers.
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

/**
 * Example 1: Basic API route with request logging
 */
export async function exampleBasicRoute(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Your business logic here
    const data = { message: 'Success' }

    const response = NextResponse.json(data, { status: 200 })
    const duration = Date.now() - startTime

    // Log the successful request
    logger.logRequest(request, response, duration)

    return response
  } catch (error) {
    const duration = Date.now() - startTime

    // Log the error
    logger.error('API request failed', error as Error, {
      path: request.nextUrl.pathname,
      method: request.method,
    })

    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )

    // Log the failed request
    logger.logRequest(request, response, duration)

    return response
  }
}

/**
 * Example 2: Quiz creation with detailed logging
 */
export async function exampleQuizCreation(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()

    // Log the quiz creation attempt
    logger.info('Quiz creation started', {
      category: body.category,
      questionCount: body.questions?.length,
    })

    // Validate input
    if (!body.title || body.title.length < 3) {
      logger.warn('Quiz creation validation failed', {
        reason: 'Invalid title',
        titleLength: body.title?.length,
      })

      const response = NextResponse.json(
        { error: 'Title must be at least 3 characters' },
        { status: 400 }
      )
      logger.logRequest(request, response, Date.now() - startTime)
      return response
    }

    // Save to database (simulated)
    const quizId = 'quiz_123'

    // Log successful creation
    logger.info('Quiz created successfully', {
      quizId,
      category: body.category,
      questionCount: body.questions?.length,
    })

    const response = NextResponse.json({ id: quizId }, { status: 201 })
    logger.logRequest(request, response, Date.now() - startTime)

    return response
  } catch (error) {
    logger.error('Quiz creation failed', error as Error, {
      path: request.nextUrl.pathname,
    })

    const response = NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    )
    logger.logRequest(request, response, Date.now() - startTime)

    return response
  }
}

/**
 * Example 3: Database operation with error handling
 */
export async function exampleDatabaseOperation() {
  try {
    // Simulate database query
    logger.debug('Executing database query', {
      table: 'quizzes',
      operation: 'SELECT',
    })

    // const result = await supabase.from('quizzes').select('*')

    logger.info('Database query successful', {
      rowCount: 10,
      duration_ms: 45,
    })
  } catch (error) {
    logger.error('Database query failed', error as Error, {
      table: 'quizzes',
      operation: 'SELECT',
    })
    throw error
  }
}

/**
 * Example 4: Rate limiting with warning logs
 */
export async function exampleRateLimitCheck(
  clientIp: string,
  requestCount: number,
  limit: number
) {
  if (requestCount >= limit * 0.8) {
    logger.warn('Client approaching rate limit', {
      clientIp,
      requestCount,
      limit,
      percentage: Math.round((requestCount / limit) * 100),
    })
  }

  if (requestCount >= limit) {
    logger.warn('Client exceeded rate limit', {
      clientIp,
      requestCount,
      limit,
    })
    return false
  }

  return true
}

/**
 * Example 5: Admin authentication with security logging
 */
export async function exampleAdminAuth(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value

  if (!sessionToken) {
    logger.warn('Admin authentication failed: No session token', {
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    })
    return null
  }

  // Verify session (simulated)
  const isValid = true // Replace with actual verification

  if (!isValid) {
    logger.warn('Admin authentication failed: Invalid session token', {
      path: request.nextUrl.pathname,
    })
    return null
  }

  logger.info('Admin authenticated successfully', {
    path: request.nextUrl.pathname,
  })

  return { authenticated: true }
}

/**
 * Example 6: Middleware logging pattern
 */
export async function exampleMiddleware(request: NextRequest) {
  const startTime = Date.now()

  logger.debug('Middleware processing request', {
    path: request.nextUrl.pathname,
    method: request.method,
  })

  // Process request...
  const response = NextResponse.next()

  const duration = Date.now() - startTime
  logger.debug('Middleware completed', {
    path: request.nextUrl.pathname,
    duration_ms: duration,
  })

  return response
}
