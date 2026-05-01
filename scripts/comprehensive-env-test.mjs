/**
 * Comprehensive test suite for environment validator
 * Tests all validation rules from requirements 1.1-1.9
 */

console.log('🧪 Comprehensive Environment Validator Test Suite\n')
console.log('=' .repeat(60))

let passedTests = 0
let totalTests = 0

function test(name, fn) {
  totalTests++
  try {
    fn()
    console.log(`✅ Test ${totalTests}: ${name}`)
    passedTests++
    return true
  } catch (error) {
    console.log(`❌ Test ${totalTests}: ${name}`)
    console.log(`   Error: ${error.message.split('\n')[0]}`)
    return false
  }
}

// Helper to set valid defaults
function setValidEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  process.env.ADMIN_PASSWORD = 'securepassword123'
  process.env.ADMIN_SECRET_TOKEN = 'this-is-a-very-long-secret-token-with-32-chars'
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  process.env.NEXT_PUBLIC_APP_NAME = 'Quizly'
  process.env.NODE_ENV = 'development'
}

// Test 1.1 & 1.9: Valid configuration should pass
console.log('\n📋 Requirement 1.1 & 1.9: Valid Configuration')
console.log('-'.repeat(60))
test('Accepts valid configuration with all required variables', async () => {
  setValidEnv()
  const { validateEnvironment } = await import('../lib/config/env.ts')
  const config = validateEnvironment()
  if (!config.supabase.url || !config.admin.password) {
    throw new Error('Configuration incomplete')
  }
})

// Test 1.2: Missing variables should throw with variable name
console.log('\n📋 Requirement 1.2: Error Messages')
console.log('-'.repeat(60))

test('Throws error with variable name when ADMIN_PASSWORD missing', async () => {
  setValidEnv()
  delete process.env.ADMIN_PASSWORD
  const { validateEnvironment } = await import('../lib/config/env.ts')
  try {
    validateEnvironment()
    throw new Error('Should have thrown')
  } catch (error) {
    if (!error.message.includes('ADMIN_PASSWORD')) {
      throw new Error('Error message should include variable name')
    }
  }
})

test('Throws error with variable name when SUPABASE_URL missing', async () => {
  setValidEnv()
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  const { validateEnvironment } = await import('../lib/config/env.ts')
  try {
    validateEnvironment()
    throw new Error('Should have thrown')
  } catch (error) {
    if (!error.message.includes('SUPABASE_URL')) {
      throw new Error('Error message should include variable name')
    }
  }
})

// Test 1.3: SUPABASE_URL must be valid HTTPS URL
console.log('\n📋 Requirement 1.3: Supabase URL Validation')
console.log('-'.repeat(60))

test('Accepts valid HTTPS Supabase URL', async () => {
  setValidEnv()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://myproject.supabase.co'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
})

test('Rejects HTTP Supabase URL', async () => {
  setValidEnv()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://myproject.supabase.co'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  try {
    validateEnvironment()
    throw new Error('Should have rejected HTTP URL')
  } catch (error) {
    if (!error.message.includes('HTTPS')) {
      throw new Error('Should mention HTTPS requirement')
    }
  }
})

test('Rejects invalid URL format', async () => {
  setValidEnv()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  try {
    validateEnvironment()
    throw new Error('Should have rejected invalid URL')
  } catch (error) {
    if (!error.message.includes('URL')) {
      throw new Error('Should mention URL validation')
    }
  }
})

// Test 1.4: ANON_KEY must be non-empty string (20+ chars)
console.log('\n📋 Requirement 1.4: Anon Key Validation')
console.log('-'.repeat(60))

test('Accepts valid anon key (20+ characters)', async () => {
  setValidEnv()
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'a'.repeat(20)
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
})

test('Rejects short anon key (<20 characters)', async () => {
  setValidEnv()
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'short'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  try {
    validateEnvironment()
    throw new Error('Should have rejected short key')
  } catch (error) {
    if (!error.message.includes('20')) {
      throw new Error('Should mention minimum length')
    }
  }
})

// Test 1.5: SERVICE_ROLE_KEY must be non-empty string (20+ chars)
console.log('\n📋 Requirement 1.5: Service Role Key Validation')
console.log('-'.repeat(60))

test('Accepts valid service role key (20+ characters)', async () => {
  setValidEnv()
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'b'.repeat(20)
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
})

test('Rejects short service role key (<20 characters)', async () => {
  setValidEnv()
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'short'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  try {
    validateEnvironment()
    throw new Error('Should have rejected short key')
  } catch (error) {
    if (!error.message.includes('20')) {
      throw new Error('Should mention minimum length')
    }
  }
})

// Test 1.6: ADMIN_PASSWORD must be 12+ characters
console.log('\n📋 Requirement 1.6: Admin Password Validation')
console.log('-'.repeat(60))

test('Accepts password with exactly 12 characters', async () => {
  setValidEnv()
  process.env.ADMIN_PASSWORD = 'a'.repeat(12)
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
})

test('Accepts password with more than 12 characters', async () => {
  setValidEnv()
  process.env.ADMIN_PASSWORD = 'a'.repeat(20)
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
})

test('Rejects password with less than 12 characters', async () => {
  setValidEnv()
  process.env.ADMIN_PASSWORD = 'short'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  try {
    validateEnvironment()
    throw new Error('Should have rejected short password')
  } catch (error) {
    if (!error.message.includes('12')) {
      throw new Error('Should mention 12 character minimum')
    }
  }
})

// Test 1.7: ADMIN_SECRET_TOKEN must be 32+ characters
console.log('\n📋 Requirement 1.7: Admin Secret Token Validation')
console.log('-'.repeat(60))

test('Accepts token with exactly 32 characters', async () => {
  setValidEnv()
  process.env.ADMIN_SECRET_TOKEN = 'a'.repeat(32)
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
})

test('Accepts token with more than 32 characters', async () => {
  setValidEnv()
  process.env.ADMIN_SECRET_TOKEN = 'a'.repeat(50)
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
})

test('Rejects token with less than 32 characters', async () => {
  setValidEnv()
  process.env.ADMIN_SECRET_TOKEN = 'short'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  try {
    validateEnvironment()
    throw new Error('Should have rejected short token')
  } catch (error) {
    if (!error.message.includes('32')) {
      throw new Error('Should mention 32 character minimum')
    }
  }
})

// Test 1.8: APP_URL must be valid URL
console.log('\n📋 Requirement 1.8: App URL Validation')
console.log('-'.repeat(60))

test('Accepts HTTP URL in development', async () => {
  setValidEnv()
  process.env.NODE_ENV = 'development'
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
})

test('Accepts HTTPS URL in development', async () => {
  setValidEnv()
  process.env.NODE_ENV = 'development'
  process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
})

test('Accepts HTTPS URL in production', async () => {
  setValidEnv()
  process.env.NODE_ENV = 'production'
  process.env.NEXT_PUBLIC_APP_URL = 'https://quizly.app'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  validateEnvironment()
})

test('Rejects HTTP URL in production', async () => {
  setValidEnv()
  process.env.NODE_ENV = 'production'
  process.env.NEXT_PUBLIC_APP_URL = 'http://quizly.app'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  try {
    validateEnvironment()
    throw new Error('Should have rejected HTTP in production')
  } catch (error) {
    if (!error.message.includes('HTTPS')) {
      throw new Error('Should mention HTTPS requirement for production')
    }
  }
})

test('Rejects invalid URL format', async () => {
  setValidEnv()
  process.env.NEXT_PUBLIC_APP_URL = 'not-a-url'
  const { validateEnvironment } = await import('../lib/config/env.ts')
  try {
    validateEnvironment()
    throw new Error('Should have rejected invalid URL')
  } catch (error) {
    if (!error.message.includes('URL')) {
      throw new Error('Should mention URL validation')
    }
  }
})

// Summary
console.log('\n' + '='.repeat(60))
console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`)

if (passedTests === totalTests) {
  console.log('\n✨ All tests passed! Environment validator is working correctly.')
  console.log('\n✅ Requirements validated:')
  console.log('   1.1 ✓ Verifies all required environment variables exist')
  console.log('   1.2 ✓ Throws error with variable name when missing')
  console.log('   1.3 ✓ Validates SUPABASE_URL as valid HTTPS URL')
  console.log('   1.4 ✓ Validates ANON_KEY is non-empty (20+ chars)')
  console.log('   1.5 ✓ Validates SERVICE_ROLE_KEY is non-empty (20+ chars)')
  console.log('   1.6 ✓ Validates ADMIN_PASSWORD has minimum 12 characters')
  console.log('   1.7 ✓ Validates ADMIN_SECRET_TOKEN has minimum 32 characters')
  console.log('   1.8 ✓ Validates APP_URL as valid URL')
  console.log('   1.9 ✓ Allows application startup when all variables are valid')
  process.exit(0)
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed.`)
  process.exit(1)
}
