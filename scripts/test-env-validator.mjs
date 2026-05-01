/**
 * Test script for environment validator
 * Run with: node scripts/test-env-validator.mjs
 */

import { z } from 'zod'

// Test 1: Valid configuration
console.log('Test 1: Valid configuration')
try {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  process.env.ADMIN_PASSWORD = 'securepassword123'
  process.env.ADMIN_SECRET_TOKEN = 'this-is-a-very-long-secret-token-with-32-chars'
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  process.env.NEXT_PUBLIC_APP_NAME = 'Quizly'
  process.env.NODE_ENV = 'development'

  const { validateEnvironment } = await import('../lib/config/env.ts')
  const config = validateEnvironment()
  console.log('✅ PASSED: Valid configuration accepted')
  console.log('   Supabase URL:', config.supabase.url)
  console.log('   App Name:', config.app.name)
} catch (error) {
  console.log('❌ FAILED:', error.message)
}

// Test 2: Missing required variable
console.log('\nTest 2: Missing ADMIN_PASSWORD')
try {
  delete process.env.ADMIN_PASSWORD
  
  // Need to clear module cache
  const modulePath = new URL('../lib/config/env.ts', import.meta.url).href
  delete (await import('module')).default._cache[modulePath]
  
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
  console.log('❌ FAILED: Should have thrown an error')
} catch (error) {
  if (error.message.includes('ADMIN_PASSWORD')) {
    console.log('✅ PASSED: Correctly caught missing ADMIN_PASSWORD')
  } else {
    console.log('❌ FAILED: Wrong error:', error.message)
  }
}

// Test 3: Password too short
console.log('\nTest 3: Short ADMIN_PASSWORD')
try {
  process.env.ADMIN_PASSWORD = 'short'
  
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
  console.log('❌ FAILED: Should have thrown an error for short password')
} catch (error) {
  if (error.message.includes('12 characters')) {
    console.log('✅ PASSED: Correctly caught short password')
  } else {
    console.log('❌ FAILED: Wrong error:', error.message)
  }
}

// Test 4: Invalid URL (not HTTPS in production)
console.log('\nTest 4: HTTP URL in production')
try {
  process.env.ADMIN_PASSWORD = 'securepassword123'
  process.env.NEXT_PUBLIC_APP_URL = 'http://example.com'
  process.env.NODE_ENV = 'production'
  
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
  console.log('❌ FAILED: Should have thrown an error for HTTP in production')
} catch (error) {
  if (error.message.includes('HTTPS')) {
    console.log('✅ PASSED: Correctly caught HTTP URL in production')
  } else {
    console.log('❌ FAILED: Wrong error:', error.message)
  }
}

// Test 5: Secret token too short
console.log('\nTest 5: Short ADMIN_SECRET_TOKEN')
try {
  process.env.NODE_ENV = 'development'
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  process.env.ADMIN_SECRET_TOKEN = 'short'
  
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
  console.log('❌ FAILED: Should have thrown an error for short token')
} catch (error) {
  if (error.message.includes('32 characters')) {
    console.log('✅ PASSED: Correctly caught short secret token')
  } else {
    console.log('❌ FAILED: Wrong error:', error.message)
  }
}

console.log('\n✨ Environment validator tests complete!')
