import { resolve } from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_PASSWORD',
  'ADMIN_SECRET_TOKEN',
  'NEXT_PUBLIC_APP_URL',
]

export function verifyEnvironment(): boolean {
  console.log('🔍 Validating Quizly Environment Setup...\n')
  let isValid = true
  const missing: string[] = []

  // Check presence
  for (const key of REQUIRED_VARS) {
    const value = process.env[key]
    if (!value) {
      console.log(`❌ Missing environment variable: ${key}`)
      missing.push(key)
      isValid = false
    } else {
      console.log(`✅ Found: ${key}`)
    }
  }

  if (!isValid) {
    console.log(`\n❌ Validation failed: Missing ${missing.length} environment variables. Please review your .env.local file.`)
    return false
  }

  // Check security constraints
  const password = process.env.ADMIN_PASSWORD || ''
  const token = process.env.ADMIN_SECRET_TOKEN || ''

  if (password.length < 16) {
    console.log(`⚠️  Warning: ADMIN_PASSWORD should be at least 16 characters (currently ${password.length}).`)
    isValid = false
  } else {
    console.log('✅ Security: ADMIN_PASSWORD meets length requirements (>= 16)')
  }

  if (token.length < 32) {
    console.log(`⚠️  Warning: ADMIN_SECRET_TOKEN should be at least 32 characters (currently ${token.length}).`)
    isValid = false
  } else {
    console.log('✅ Security: ADMIN_SECRET_TOKEN meets length requirements (>= 32)')
  }

  if (isValid) {
    console.log('\n✨ Environment is valid and secure! Ready for full-stack production.')
  } else {
    console.log('\n⚠️  Environment configuration check complete with warnings.')
  }

  return isValid
}

// Execute if run directly
if (require.main === module) {
  const result = verifyEnvironment()
  process.exit(result ? 0 : 1)
}
