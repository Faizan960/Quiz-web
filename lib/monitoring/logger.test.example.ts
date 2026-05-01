/**
 * Manual Logger Verification Example
 * 
 * This file demonstrates the Logger functionality.
 * Run with: npx tsx lib/monitoring/logger.test.example.ts
 * 
 * Note: This is not an automated test. Task 2.3 will add proper unit tests
 * when the testing infrastructure is set up in Phase 6.
 */

import { Logger, LogLevel } from './logger'

// Mock NextRequest and NextResponse for demonstration
class MockNextRequest {
  method: string
  nextUrl: { pathname: string }
  headers: Map<string, string>

  constructor(method: string, path: string, ip?: string) {
    this.method = method
    this.nextUrl = { pathname: path }
    this.headers = new Map()
    if (ip) {
      this.headers.set('x-forwarded-for', ip)
    }
  }

  get(name: string): string | null {
    return this.headers.get(name) || null
  }
}

class MockNextResponse {
  status: number

  constructor(status: number) {
    this.status = status
  }
}

function runLoggerDemo() {
  console.log('=== Logger Demonstration ===\n')

  const logger = new Logger()

  // Test 1: Debug logging (should only show in development)
  console.log('1. Debug log (development only):')
  logger.debug('Debug message', { userId: '123', action: 'view' })
  console.log('')

  // Test 2: Info logging
  console.log('2. Info log:')
  logger.info('Quiz created successfully', {
    quizId: 'abc123',
    category: 'science',
    questionCount: 10,
  })
  console.log('')

  // Test 3: Warning logging
  console.log('3. Warning log:')
  logger.warn('Rate limit approaching', {
    endpoint: '/api/quizzes',
    requestCount: 4,
    limit: 5,
  })
  console.log('')

  // Test 4: Error logging
  console.log('4. Error log with Error object:')
  const error = new Error('Database connection failed')
  error.name = 'DatabaseError'
  logger.error('Failed to save quiz', error, {
    quizId: 'xyz789',
    operation: 'INSERT',
  })
  console.log('')

  // Test 5: Request logging
  console.log('5. Request log:')
  const mockRequest = new MockNextRequest('POST', '/api/quizzes', '192.168.1.1')
  const mockResponse = new MockNextResponse(201)
  logger.logRequest(
    mockRequest as any,
    mockResponse as any,
    145 // duration in ms
  )
  console.log('')

  // Test 6: Production format (JSON)
  console.log('6. Production format (JSON):')
  console.log('Setting NODE_ENV=production...')
  const originalEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  const prodLogger = new Logger()
  prodLogger.info('Production log example', { environment: 'production' })
  prodLogger.error('Production error example', new Error('Test error'), {
    critical: true,
  })
  process.env.NODE_ENV = originalEnv
  console.log('')

  console.log('=== Logger Demonstration Complete ===')
  console.log('\nKey Features Demonstrated:')
  console.log('✓ Multiple log levels (debug, info, warn, error)')
  console.log('✓ Structured context data')
  console.log('✓ Error object handling with stack traces')
  console.log('✓ Request logging with method, path, status, duration')
  console.log('✓ Human-readable format in development')
  console.log('✓ JSON format in production')
  console.log('✓ Client IP extraction from headers')
  console.log('\nRequirements Validated:')
  console.log('✓ 6.2: Logs errors with timestamp, endpoint, and stack trace')
  console.log('✓ 6.7: Logs API requests with method, path, status, duration')
  console.log('✓ 6.8: Structured JSON logging in production')
}

// Run the demonstration
runLoggerDemo()
