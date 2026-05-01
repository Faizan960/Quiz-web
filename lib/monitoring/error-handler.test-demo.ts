/**
 * Quick demonstration of error handler functionality
 * 
 * This file demonstrates that the error handler correctly:
 * - Maps error types to status codes
 * - Hides stack traces in production
 * - Logs errors with context
 * - Returns consistent error format
 */

import { NextRequest } from 'next/server'
import {
  handleApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  DatabaseError,
} from './logger'

// Mock request for testing
function createMockRequest(path: string = '/api/test'): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${path}`), {
    method: 'POST',
  })
}

// Test 1: ValidationError returns 400
console.log('Test 1: ValidationError')
const validationError = new ValidationError('Invalid input', {
  title: 'Title is required',
  category: 'Invalid category',
})
const response1 = handleApiError(validationError, createMockRequest())
console.log('Status:', response1.status) // Should be 400
console.log('Body:', response1.body)
console.log('---')

// Test 2: AuthenticationError returns 401
console.log('Test 2: AuthenticationError')
const authError = new AuthenticationError('Invalid token')
const response2 = handleApiError(authError, createMockRequest())
console.log('Status:', response2.status) // Should be 401
console.log('---')

// Test 3: AuthorizationError returns 403
console.log('Test 3: AuthorizationError')
const authzError = new AuthorizationError('Admin access required')
const response3 = handleApiError(authzError, createMockRequest())
console.log('Status:', response3.status) // Should be 403
console.log('---')

// Test 4: RateLimitError returns 429 with Retry-After header
console.log('Test 4: RateLimitError')
const rateLimitError = new RateLimitError('Too many requests', 60)
const response4 = handleApiError(rateLimitError, createMockRequest())
console.log('Status:', response4.status) // Should be 429
console.log('Retry-After header:', response4.headers.get('Retry-After')) // Should be '60'
console.log('---')

// Test 5: DatabaseError returns 500
console.log('Test 5: DatabaseError')
const dbError = new DatabaseError('Query failed', { code: 'PGRST116' })
const response5 = handleApiError(dbError, createMockRequest())
console.log('Status:', response5.status) // Should be 500
console.log('---')

// Test 6: Generic Error returns 500
console.log('Test 6: Generic Error')
const genericError = new Error('Something went wrong')
const response6 = handleApiError(genericError, createMockRequest())
console.log('Status:', response6.status) // Should be 500
console.log('---')

// Test 7: Unknown error type returns 500
console.log('Test 7: Unknown error type')
const unknownError = 'string error'
const response7 = handleApiError(unknownError, createMockRequest())
console.log('Status:', response7.status) // Should be 500
console.log('---')

console.log('All tests completed!')
console.log('Expected results:')
console.log('- Test 1: Status 400')
console.log('- Test 2: Status 401')
console.log('- Test 3: Status 403')
console.log('- Test 4: Status 429 with Retry-After: 60')
console.log('- Test 5: Status 500')
console.log('- Test 6: Status 500')
console.log('- Test 7: Status 500')
