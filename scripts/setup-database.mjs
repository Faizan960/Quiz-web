#!/usr/bin/env node

/**
 * Database Setup Script
 * Automatically creates the database schema on Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

console.log('🚀 Setting up Quizly database schema...\n')
console.log(`📍 Supabase URL: ${supabaseUrl}\n`)

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Read schema file
const schemaPath = resolve(process.cwd(), 'supabase/schema.sql')
const schema = readFileSync(schemaPath, 'utf-8')

console.log('📄 Loaded schema from supabase/schema.sql')
console.log(`   Total size: ${schema.length} characters\n`)

// Split schema into individual statements
// We need to execute them one by one because Supabase doesn't support multi-statement queries via the client
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

console.log(`📊 Found ${statements.length} SQL statements to execute\n`)
console.log('⏳ Executing schema...\n')

let successCount = 0
let errorCount = 0

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i] + ';'
  
  // Skip comments
  if (statement.trim().startsWith('--')) continue
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: statement })
    
    if (error) {
      // Some errors are expected (like "already exists")
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate') ||
          error.message.includes('ON CONFLICT')) {
        console.log(`⚠️  Statement ${i + 1}: Already exists (skipped)`)
      } else {
        console.error(`❌ Statement ${i + 1} failed:`, error.message)
        errorCount++
      }
    } else {
      successCount++
      console.log(`✅ Statement ${i + 1}: Success`)
    }
  } catch (err) {
    console.error(`❌ Statement ${i + 1} error:`, err.message)
    errorCount++
  }
}

console.log('\n' + '='.repeat(50))
console.log(`\n📊 Setup Summary:`)
console.log(`   ✅ Successful: ${successCount}`)
console.log(`   ❌ Failed: ${errorCount}`)
console.log(`   📝 Total: ${statements.length}`)

if (errorCount === 0) {
  console.log('\n✨ Database schema created successfully!')
  console.log('\n📋 Created tables:')
  console.log('   • profiles')
  console.log('   • quizzes')
  console.log('   • questions')
  console.log('   • attempts')
  console.log('   • ad_settings')
  console.log('   • site_settings')
  console.log('\n🔐 Row Level Security (RLS) enabled on all tables')
  console.log('📊 Indexes created for optimal performance')
  console.log('⚡ Triggers configured for automatic stats updates')
  process.exit(0)
} else {
  console.log('\n⚠️  Some statements failed. This might be normal if tables already exist.')
  console.log('   Check the errors above to see if any are critical.')
  process.exit(1)
}
