#!/usr/bin/env node

/**
 * Test actual .env.local configuration
 * This script loads and validates the actual environment variables
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

console.log('🔍 Testing actual .env.local configuration...\n')

// Check each required variable
const checks = {
  'NEXT_PUBLIC_SUPABASE_URL': {
    value: process.env.NEXT_PUBLIC_SUPABASE_URL,
    test: (v) => v && v.startsWith('https://') && v.includes('.supabase.co'),
    requirement: 'Must be HTTPS URL ending in .supabase.co'
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    test: (v) => v && v.length >= 20,
    requirement: 'Must be at least 20 characters'
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    value: process.env.SUPABASE_SERVICE_ROLE_KEY,
    test: (v) => v && v.length >= 20,
    requirement: 'Must be at least 20 characters'
  },
  'ADMIN_PASSWORD': {
    value: process.env.ADMIN_PASSWORD,
    test: (v) => v && v.length >= 12,
    requirement: 'Must be at least 12 characters'
  },
  'ADMIN_SECRET_TOKEN': {
    value: process.env.ADMIN_SECRET_TOKEN,
    test: (v) => v && v.length >= 32,
    requirement: 'Must be at least 32 characters'
  },
  'NEXT_PUBLIC_APP_URL': {
    value: process.env.NEXT_PUBLIC_APP_URL,
    test: (v) => v && (v.startsWith('http://') || v.startsWith('https://')),
    requirement: 'Must be valid URL'
  },
  'NEXT_PUBLIC_APP_NAME': {
    value: process.env.NEXT_PUBLIC_APP_NAME,
    test: (v) => v && v.length > 0,
    requirement: 'Must be non-empty string'
  }
}

let allPassed = true

for (const [name, check] of Object.entries(checks)) {
  const passed = check.test(check.value)
  const status = passed ? '✅' : '❌'
  const valueDisplay = check.value 
    ? (check.value.length > 50 ? check.value.substring(0, 47) + '...' : check.value)
    : '(not set)'
  
  console.log(`${status} ${name}`)
  console.log(`   Value: ${valueDisplay}`)
  
  if (!passed) {
    console.log(`   ❌ Failed: ${check.requirement}`)
    allPassed = false
  }
  
  console.log()
}

if (allPassed) {
  console.log('✨ All environment variables are valid!')
  console.log('\n📋 Summary:')
  console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log(`   Admin Password: ${process.env.ADMIN_PASSWORD.length} characters`)
  console.log(`   Admin Token: ${process.env.ADMIN_SECRET_TOKEN.length} characters`)
  console.log(`   App URL: ${process.env.NEXT_PUBLIC_APP_URL}`)
  console.log(`   App Name: ${process.env.NEXT_PUBLIC_APP_NAME}`)
  console.log('\n✅ Environment is ready for development!')
  process.exit(0)
} else {
  console.log('❌ Some environment variables are invalid or missing.')
  console.log('Please check your .env.local file.')
  process.exit(1)
}
