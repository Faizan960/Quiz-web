#!/usr/bin/env node

/**
 * Database Verification Script
 * Checks if all required tables and data exist
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

console.log('🔍 Verifying Quizly database setup...\n')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const requiredTables = [
  'profiles',
  'quizzes',
  'questions',
  'attempts',
  'ad_settings',
  'site_settings'
]

let allTablesExist = true

console.log('📊 Checking tables...\n')

for (const table of requiredTables) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(0)
    
    if (error) {
      console.log(`❌ ${table}: NOT FOUND`)
      console.log(`   Error: ${error.message}`)
      allTablesExist = false
    } else {
      console.log(`✅ ${table}: EXISTS`)
    }
  } catch (err) {
    console.log(`❌ ${table}: ERROR`)
    console.log(`   ${err.message}`)
    allTablesExist = false
  }
}

console.log('\n' + '='.repeat(50))

if (allTablesExist) {
  console.log('\n✨ All required tables exist!')
  
  // Check if default data exists
  console.log('\n🔍 Checking default data...\n')
  
  const { data: adSettings } = await supabase
    .from('ad_settings')
    .select('*')
    .single()
  
  const { data: siteSettings } = await supabase
    .from('site_settings')
    .select('*')
    .single()
  
  if (adSettings) {
    console.log('✅ ad_settings: Default row exists')
  } else {
    console.log('⚠️  ad_settings: No default row found')
  }
  
  if (siteSettings) {
    console.log('✅ site_settings: Default row exists')
    console.log(`   Site name: ${siteSettings.site_name}`)
    console.log(`   Tagline: ${siteSettings.tagline}`)
  } else {
    console.log('⚠️  site_settings: No default row found')
  }
  
  console.log('\n✅ Database is ready!')
  console.log('\n📋 Next steps:')
  console.log('   1. Run: npm run dev')
  console.log('   2. Visit: http://localhost:3000')
  console.log('   3. Create your first quiz!')
  
  process.exit(0)
} else {
  console.log('\n❌ Some tables are missing!')
  console.log('\n📋 To fix this:')
  console.log('   1. Go to Supabase Dashboard → SQL Editor')
  console.log('   2. Copy the contents of supabase/schema.sql')
  console.log('   3. Paste and run in SQL Editor')
  
  process.exit(1)
}
