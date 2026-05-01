/**
 * Health Check API Endpoint
 * 
 * Provides system health status for monitoring and alerting.
 * Returns 200 for healthy, 503 for unhealthy.
 * Completes within 5 seconds with timeout protection.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
 */

import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/monitoring/health'

/**
 * GET /api/health
 * 
 * Returns health status including:
 * - Overall status (healthy/unhealthy)
 * - Database connectivity and latency
 * - Schema verification status
 * - Application version
 * - Response time
 */
export async function GET() {
  try {
    // Create a promise that will timeout after 5 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), 5000)
    })
    
    // Race between health check and timeout
    const healthResult = await Promise.race([
      checkDatabaseHealth(),
      timeoutPromise,
    ])
    
    // Return appropriate status code based on health
    const statusCode = healthResult.status === 'healthy' ? 200 : 503
    
    return NextResponse.json(healthResult, { status: statusCode })
  } catch (error) {
    // If health check times out or fails, return unhealthy status
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
        checks: {
          database: {
            connected: false,
            latency_ms: 0,
            tables_verified: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        response_time_ms: 5000,
      },
      { status: 503 }
    )
  }
}
