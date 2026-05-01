/**
 * Usage Examples for API Error Handler
 * 
 * This file demonstrates how to use the handleApiError function
 * and custom error types in API routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  handleApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  DatabaseError,
} from './logger'

/**
 * Example 1: Basic error handling in an API route
 */
export async function POST_Example1(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Your API logic here
    // ...
    
    return NextResponse.json({ success: true })
  } catch (error) {
    // Centralized error handling
    return handleApiError(error, request)
  }
}

/**
 * Example 2: Throwing validation errors
 */
export async function POST_Example2(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body.title || body.title.length < 3) {
      throw new ValidationError('Title must be at least 3 characters', {
        title: 'Title is too short',
      })
    }
    
    if (!body.category) {
      throw new ValidationError('Category is required', {
        category: 'Category field is missing',
      })
    }
    
    // Process valid data
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, request)
  }
}

/**
 * Example 3: Authentication errors
 */
export async function GET_Example3(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    
    if (!token) {
      throw new AuthenticationError('Missing authentication token')
    }
    
    // Verify token
    const isValid = verifyToken(token)
    if (!isValid) {
      throw new AuthenticationError('Invalid or expired token')
    }
    
    return NextResponse.json({ data: 'protected data' })
  } catch (error) {
    return handleApiError(error, request)
  }
}

/**
 * Example 4: Authorization errors
 */
export async function DELETE_Example4(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user.isAdmin) {
      throw new AuthorizationError('Admin access required')
    }
    
    // Perform admin action
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, request)
  }
}

/**
 * Example 5: Rate limiting errors
 */
export async function POST_Example5(request: NextRequest) {
  try {
    const rateLimitResult = checkRateLimit(request)
    
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(
        'Too many requests, please try again later',
        rateLimitResult.retryAfter
      )
    }
    
    // Process request
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, request)
  }
}

/**
 * Example 6: Database errors
 */
export async function GET_Example6(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .single()
    
    if (error) {
      throw new DatabaseError('Failed to fetch quiz', error)
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error, request)
  }
}

/**
 * Example 7: Generic error handling
 * 
 * Any unhandled Error or unknown error type will be caught
 * and returned as a 500 Internal Server Error
 */
export async function POST_Example7(request: NextRequest) {
  try {
    // Some operation that might throw an unexpected error
    const result = riskyOperation()
    
    return NextResponse.json({ result })
  } catch (error) {
    // handleApiError will log the error and return appropriate response
    return handleApiError(error, request)
  }
}

/**
 * Example 8: Multiple error types in one route
 */
export async function PUT_Example8(request: NextRequest) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')
    if (!token) {
      throw new AuthenticationError()
    }
    
    // Parse and validate input
    const body = await request.json()
    if (!body.id || !body.title) {
      throw new ValidationError('Missing required fields', {
        ...(!body.id && { id: 'ID is required' }),
        ...(!body.title && { title: 'Title is required' }),
      })
    }
    
    // Check authorization
    const user = await getCurrentUser(token)
    const resource = await getResource(body.id)
    if (resource.ownerId !== user.id) {
      throw new AuthorizationError('You can only edit your own resources')
    }
    
    // Update database
    const { data, error } = await supabase
      .from('resources')
      .update({ title: body.title })
      .eq('id', body.id)
      .select()
      .single()
    
    if (error) {
      throw new DatabaseError('Failed to update resource', error)
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error, request)
  }
}

// Mock helper functions for examples
function verifyToken(token: string): boolean {
  return token === 'valid-token'
}

async function getCurrentUser(tokenOrRequest: string | NextRequest) {
  return { id: '123', isAdmin: false }
}

async function getResource(id: string) {
  return { id, ownerId: '123', title: 'Resource' }
}

function checkRateLimit(request: NextRequest) {
  return { allowed: true, retryAfter: 60 }
}

function riskyOperation() {
  return 'success'
}

const supabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      single: async () => ({ data: null, error: null }),
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  }),
}
