# Environment Configuration

This directory contains environment variable validation and configuration management.

## Overview

The environment validator ensures all required environment variables are present and valid at application startup. It uses [Zod](https://zod.dev/) for schema validation and provides type-safe access to configuration values.

## Usage

### Basic Usage

```typescript
import { env } from '@/lib/config/env'

// Access validated environment variables
const supabaseUrl = env.supabase.url
const adminPassword = env.admin.password
const appName = env.app.name
```

### Manual Validation

```typescript
import { validateEnvironment } from '@/lib/config/env'

try {
  const config = validateEnvironment()
  console.log('Environment is valid:', config)
} catch (error) {
  console.error('Environment validation failed:', error.message)
  process.exit(1)
}
```

## Environment Variables

### Required Variables

| Variable | Description | Validation Rules |
|----------|-------------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Must be valid HTTPS URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Minimum 20 characters |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Minimum 20 characters |
| `ADMIN_PASSWORD` | Admin panel password | Minimum 12 characters |
| `ADMIN_SECRET_TOKEN` | Admin session secret | Minimum 32 characters |
| `NEXT_PUBLIC_APP_URL` | Application public URL | Valid URL (HTTPS in production) |
| `NEXT_PUBLIC_APP_NAME` | Application name | Non-empty string |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 ID | undefined |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | Google AdSense Publisher ID | undefined |

## Validation Rules

### URL Validation
- **Development**: Accepts both `http://` and `https://` URLs
- **Production**: Requires `https://` URLs for security
- Supabase URL must always use `https://`

### String Length Validation
- **ADMIN_PASSWORD**: Minimum 12 characters for security
- **ADMIN_SECRET_TOKEN**: Minimum 32 characters for cryptographic strength
- **Supabase Keys**: Minimum 20 characters (typical JWT length)

### Error Handling

When validation fails, the validator throws a descriptive error:

```
Environment validation failed:
  - ADMIN_PASSWORD must be at least 12 characters (admin.password)
  - NEXT_PUBLIC_SUPABASE_URL must use HTTPS protocol (supabase.url)

Please check your .env.local file and ensure all required variables are set.
```

## Setup Instructions

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in required values**:
   - Get Supabase credentials from your [Supabase Dashboard](https://supabase.com/dashboard)
   - Generate a strong admin password (12+ characters)
   - Generate a random secret token:
     ```bash
     openssl rand -base64 32
     ```

3. **Verify configuration**:
   ```bash
   node scripts/simple-env-test.mjs
   ```

## Type Safety

The validator exports a TypeScript type for the configuration:

```typescript
import type { EnvironmentConfig } from '@/lib/config/env'

function useConfig(config: EnvironmentConfig) {
  // config is fully typed
  const url: string = config.supabase.url
  const nodeEnv: 'development' | 'production' | 'test' = config.app.nodeEnv
}
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **1.1**: Verifies all required environment variables exist at startup
- **1.2**: Throws error with variable name when missing
- **1.3**: Validates NEXT_PUBLIC_SUPABASE_URL as valid HTTPS URL
- **1.4**: Validates NEXT_PUBLIC_SUPABASE_ANON_KEY is non-empty string (20+ chars)
- **1.5**: Validates SUPABASE_SERVICE_ROLE_KEY is non-empty string (20+ chars)
- **1.6**: Validates ADMIN_PASSWORD has minimum 12 characters
- **1.7**: Validates ADMIN_SECRET_TOKEN has minimum 32 characters
- **1.8**: Validates NEXT_PUBLIC_APP_URL as valid URL
- **1.9**: Allows application startup when all variables are valid

## Security Notes

- **Never commit `.env.local`** to version control
- **Keep `SUPABASE_SERVICE_ROLE_KEY` secret** - it has admin privileges
- **Use strong passwords** for `ADMIN_PASSWORD` in production
- **Generate random tokens** for `ADMIN_SECRET_TOKEN` using cryptographically secure methods
- **Use HTTPS** for `NEXT_PUBLIC_APP_URL` in production

## Troubleshooting

### "Environment validation failed"

Check that:
1. All required variables are set in `.env.local`
2. URLs use the correct protocol (HTTPS for Supabase and production)
3. Passwords and tokens meet minimum length requirements
4. No typos in variable names

### "Module not found"

Ensure Zod is installed:
```bash
npm install zod
```

### TypeScript errors

Run type checking:
```bash
npx tsc --noEmit
```
