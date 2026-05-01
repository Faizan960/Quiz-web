/**
 * Database Health Checker
 * 
 * Provides functions to verify database connectivity and schema integrity.
 * Used by the health check endpoint to report system status.
 */

import { createAdminClient } from '@/lib/supabase/server'

/**
 * Health check result structure
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    database: {
      connected: boolean
      latency_ms: number
      tables_verified: boolean
      missing_tables?: string[]
    }
  }
  response_time_ms: number
}

/**
 * Schema verification result
 */
export interface SchemaVerificationResult {
  valid: boolean
  missing: string[]
}

/**
 * Required database tables for the application
 */
const REQUIRED_TABLES = [
  'profiles',
  'quizzes',
  'questions',
  'attempts',
  'ad_settings',
  'site_settings',
]

/**
 * Verify that all required database tables exist
 * 
 * @returns Promise with validation result and list of missing tables
 */
export async function verifyDatabaseSchema(): Promise<SchemaVerificationResult> {
  try {
    const supabase = createAdminClient()
    
    // Query information_schema to get all tables in the public schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', REQUIRED_TABLES)
    
    if (error) {
      // If we can't query information_schema, try an alternative approach
      // Query each table directly to see if it exists
      const existingTables: string[] = []
      
      for (const table of REQUIRED_TABLES) {
        try {
          const { error: tableError } = await supabase
            .from(table)
            .select('*')
            .limit(0)
          
          if (!tableError) {
            existingTables.push(table)
          }
        } catch {
          // Table doesn't exist or can't be queried
        }
      }
      
      const missing = REQUIRED_TABLES.filter(
        table => !existingTables.includes(table)
      )
      
      return {
        valid: missing.length === 0,
        missing,
      }
    }
    
    const existingTables = data?.map((row: { table_name: string }) => row.table_name) || []
    const missing = REQUIRED_TABLES.filter(
      table => !existingTables.includes(table)
    )
    
    return {
      valid: missing.length === 0,
      missing,
    }
  } catch (error) {
    console.error('Schema verification error:', error)
    // If verification fails, assume all tables are missing
    return {
      valid: false,
      missing: REQUIRED_TABLES,
    }
  }
}

/**
 * Check database health including connectivity and schema verification
 * 
 * @returns Promise with complete health check result
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  
  // Get version from package.json
  const version = process.env.npm_package_version || '0.1.0'
  
  let connected = false
  let latency_ms = 0
  let tables_verified = false
  let missing_tables: string[] | undefined
  
  try {
    // Test database connectivity with a simple query
    const queryStart = Date.now()
    const supabase = createAdminClient()
    
    // Try to query a simple table to test connectivity
    const { error } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)
    
    latency_ms = Date.now() - queryStart
    connected = !error
    
    if (connected) {
      // Verify schema if connection succeeded
      const schemaResult = await verifyDatabaseSchema()
      tables_verified = schemaResult.valid
      
      if (!schemaResult.valid) {
        missing_tables = schemaResult.missing
      }
    }
  } catch (error) {
    console.error('Database health check error:', error)
    connected = false
    tables_verified = false
    missing_tables = REQUIRED_TABLES
  }
  
  const response_time_ms = Date.now() - startTime
  
  // Determine overall health status
  const status = connected && tables_verified ? 'healthy' : 'unhealthy'
  
  return {
    status,
    timestamp,
    version,
    checks: {
      database: {
        connected,
        latency_ms,
        tables_verified,
        ...(missing_tables && { missing_tables }),
      },
    },
    response_time_ms,
  }
}
