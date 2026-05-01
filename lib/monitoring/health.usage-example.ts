/**
 * Database Health Checker - Usage Example
 * 
 * This file demonstrates the health checker functionality.
 * Run with: npx tsx lib/monitoring/health.usage-example.ts
 * 
 * Note: This is not an automated test. Task 3.3 will add proper integration tests.
 */

import { checkDatabaseHealth, verifyDatabaseSchema } from './health'

async function main() {
  console.log('=== Database Health Checker Usage Example ===\n')
  
  // Example 1: Verify database schema
  console.log('1. Verifying database schema...')
  try {
    const schemaResult = await verifyDatabaseSchema()
    console.log('Schema verification result:', JSON.stringify(schemaResult, null, 2))
    
    if (schemaResult.valid) {
      console.log('✓ All required tables exist\n')
    } else {
      console.log('✗ Missing tables:', schemaResult.missing.join(', '), '\n')
    }
  } catch (error) {
    console.error('Schema verification failed:', error, '\n')
  }
  
  // Example 2: Full health check
  console.log('2. Running full health check...')
  try {
    const healthResult = await checkDatabaseHealth()
    console.log('Health check result:', JSON.stringify(healthResult, null, 2))
    
    if (healthResult.status === 'healthy') {
      console.log('✓ System is healthy')
      console.log(`  - Database connected: ${healthResult.checks.database.connected}`)
      console.log(`  - Database latency: ${healthResult.checks.database.latency_ms}ms`)
      console.log(`  - Tables verified: ${healthResult.checks.database.tables_verified}`)
      console.log(`  - Total response time: ${healthResult.response_time_ms}ms`)
    } else {
      console.log('✗ System is unhealthy')
      if (!healthResult.checks.database.connected) {
        console.log('  - Database connection failed')
      }
      if (!healthResult.checks.database.tables_verified) {
        console.log('  - Schema verification failed')
        if (healthResult.checks.database.missing_tables) {
          console.log('  - Missing tables:', healthResult.checks.database.missing_tables.join(', '))
        }
      }
    }
  } catch (error) {
    console.error('Health check failed:', error)
  }
  
  console.log('\n=== Example Complete ===')
}

main()
