/**
 * Integration Example: Using Error Handler in API Routes
 * 
 * This file shows how to refactor existing API routes to use
 * the centralized error handler.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  handleApiError,
  ValidationError,
  DatabaseError,
} from '@/lib/monitoring/logger'

/**
 * BEFORE: Manual error handling (inconsistent, verbose)
 */
export async function POST_Before(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || !body.category || !body.questions?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (body.questions.length < 1 || body.questions.length > 30) {
      return NextResponse.json({ error: 'Must have 1–30 questions' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({ title: body.title, category: body.category })
      .select()
      .single()

    if (quizError || !quiz) {
      return NextResponse.json({ error: quizError?.message }, { status: 500 })
    }

    return NextResponse.json({ quiz }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * AFTER: Centralized error handling (consistent, clean, secure)
 */
export async function POST_After(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation with detailed error messages
    if (!body.title || !body.category || !body.questions?.length) {
      throw new ValidationError('Missing required fields', {
        ...(!body.title && { title: 'Title is required' }),
        ...(!body.category && { category: 'Category is required' }),
        ...(!body.questions?.length && { questions: 'At least one question is required' }),
      })
    }

    if (body.questions.length < 1 || body.questions.length > 30) {
      throw new ValidationError('Invalid question count', {
        questions: `Must have 1-30 questions, got ${body.questions.length}`,
      })
    }

    const supabase = await createClient()

    // Database operation with proper error handling
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({ title: body.title, category: body.category })
      .select()
      .single()

    if (quizError || !quiz) {
      throw new DatabaseError('Failed to create quiz', quizError)
    }

    return NextResponse.json({ quiz }, { status: 201 })
  } catch (error) {
    // Single line handles all error types consistently
    return handleApiError(error, request)
  }
}

/**
 * Benefits of the new approach:
 * 
 * 1. CONSISTENCY
 *    - All errors follow the same format
 *    - Status codes are automatically mapped
 *    - Error codes are machine-readable
 * 
 * 2. SECURITY
 *    - Stack traces hidden in production
 *    - Internal details not exposed
 *    - Comprehensive logging for debugging
 * 
 * 3. MAINTAINABILITY
 *    - Single source of truth for error handling
 *    - Easy to add new error types
 *    - Less boilerplate in routes
 * 
 * 4. DEVELOPER EXPERIENCE
 *    - Clear error types with TypeScript
 *    - Detailed field-level validation errors
 *    - Better debugging with context logging
 * 
 * 5. CLIENT EXPERIENCE
 *    - Consistent error format
 *    - Helpful error messages
 *    - Machine-readable error codes
 */

/**
 * Example error responses:
 * 
 * ValidationError (400):
 * {
 *   "error": "Missing required fields",
 *   "code": "VALIDATION_ERROR",
 *   "details": {
 *     "title": "Title is required",
 *     "category": "Category is required"
 *   }
 * }
 * 
 * DatabaseError (500):
 * {
 *   "error": "Database operation failed",
 *   "code": "DATABASE_ERROR"
 * }
 * 
 * Note: Stack traces and internal details only appear in development mode
 */
