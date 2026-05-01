import { z } from 'zod'

/**
 * Environment Configuration Schema
 * 
 * Validates all required environment variables at application startup.
 * Throws descriptive errors if validation fails.
 * 
 * Requirements validated:
 * - 1.1: Verify all required environment variables exist
 * - 1.2: Throw error with variable name when missing
 * - 1.3: Validate NEXT_PUBLIC_SUPABASE_URL as valid HTTPS URL
 * - 1.4: Validate NEXT_PUBLIC_SUPABASE_ANON_KEY is non-empty string
 * - 1.5: Validate SUPABASE_SERVICE_ROLE_KEY is non-empty string
 * - 1.6: Validate ADMIN_PASSWORD has minimum length of 12 characters
 * - 1.7: Validate ADMIN_SECRET_TOKEN has minimum length of 32 characters
 * - 1.8: Validate NEXT_PUBLIC_APP_URL as valid URL
 * - 1.9: Allow application startup when all variables are valid
 */

// Environment schema with validation rules
const envSchema = z.object({
  // Supabase configuration
  supabase: z.object({
    url: z
      .string()
      .min(1, 'NEXT_PUBLIC_SUPABASE_URL is required')
      .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
      .refine(
        (url) => url.startsWith('https://'),
        'NEXT_PUBLIC_SUPABASE_URL must use HTTPS protocol'
      ),
    anonKey: z
      .string()
      .min(20, 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be at least 20 characters'),
    serviceRoleKey: z
      .string()
      .min(20, 'SUPABASE_SERVICE_ROLE_KEY must be at least 20 characters'),
  }),

  // Admin configuration
  admin: z.object({
    password: z
      .string()
      .min(12, 'ADMIN_PASSWORD must be at least 12 characters'),
    secretToken: z
      .string()
      .min(32, 'ADMIN_SECRET_TOKEN must be at least 32 characters'),
  }),

  // Application configuration
  app: z.object({
    url: z
      .string()
      .min(1, 'NEXT_PUBLIC_APP_URL is required')
      .url('NEXT_PUBLIC_APP_URL must be a valid URL')
      .refine(
        (url) => {
          // Allow http for development, require https for production
          const nodeEnv = process.env.NODE_ENV
          if (nodeEnv === 'production') {
            return url.startsWith('https://')
          }
          return url.startsWith('http://') || url.startsWith('https://')
        },
        'NEXT_PUBLIC_APP_URL must use HTTPS in production'
      ),
    name: z.string().min(1, 'NEXT_PUBLIC_APP_NAME is required'),
    nodeEnv: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  }),

  // Optional analytics configuration
  analytics: z.object({
    gaId: z.string().optional(),
  }),

  // Optional AdSense configuration
  adsense: z.object({
    publisherId: z.string().optional(),
  }),
})

// Infer TypeScript type from schema
export type EnvironmentConfig = z.infer<typeof envSchema>

/**
 * Validates environment variables and returns typed configuration object.
 * 
 * @throws {Error} If any required environment variable is missing or invalid
 * @returns {EnvironmentConfig} Validated and typed environment configuration
 */
export function validateEnvironment(): EnvironmentConfig {
  try {
    const config = {
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      admin: {
        password: process.env.ADMIN_PASSWORD,
        secretToken: process.env.ADMIN_SECRET_TOKEN,
      },
      app: {
        url: process.env.NEXT_PUBLIC_APP_URL,
        name: process.env.NEXT_PUBLIC_APP_NAME || 'Quizly',
        nodeEnv: (process.env.NODE_ENV || 'development') as
          | 'development'
          | 'production'
          | 'test',
      },
      analytics: {
        gaId: process.env.NEXT_PUBLIC_GA_ID,
      },
      adsense: {
        publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
      },
    }

    // Validate against schema
    return envSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors for better readability
      const errorMessages = error.issues.map((err) => {
        const path = err.path.join('.')
        return `  - ${err.message} (${path})`
      })

      throw new Error(
        `Environment validation failed:\n${errorMessages.join('\n')}\n\n` +
          `Please check your .env.local file and ensure all required variables are set.`
      )
    }
    throw error
  }
}

/**
 * Validated environment configuration object.
 * 
 * This object is validated at module load time, ensuring that the application
 * will not start with invalid configuration.
 * 
 * @example
 * import { env } from '@/lib/config/env'
 * 
 * const supabaseUrl = env.supabase.url
 * const adminPassword = env.admin.password
 */
export const env = validateEnvironment()
