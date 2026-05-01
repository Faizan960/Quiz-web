# Monitoring Module

This module provides structured logging and health monitoring capabilities for the Quizly application.

## Logger

The Logger class provides structured logging with multiple log levels and automatic formatting based on environment.

### Features

- **Multiple log levels**: debug, info, warn, error
- **Structured context**: Attach arbitrary context data to logs
- **Error handling**: Automatic error object formatting with stack traces
- **Request logging**: Log API requests with method, path, status, and duration
- **Environment-aware formatting**:
  - Development: Human-readable colored console output
  - Production: JSON format for log aggregation systems
- **Client IP extraction**: Automatically extracts client IP from request headers

### Usage

```typescript
import { logger } from '@/lib/monitoring/logger'

// Info logging with context
logger.info('Quiz created successfully', {
  quizId: 'abc123',
  category: 'science',
  questionCount: 10,
})

// Error logging with Error object
try {
  await saveQuiz(data)
} catch (error) {
  logger.error('Failed to save quiz', error as Error, {
    quizId: data.id,
    operation: 'INSERT',
  })
}

// Request logging in API routes
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  // ... handle request ...
  
  const response = NextResponse.json({ success: true })
  const duration = Date.now() - startTime
  
  logger.logRequest(request, response, duration)
  
  return response
}

// Warning logging
logger.warn('Rate limit approaching', {
  endpoint: '/api/quizzes',
  requestCount: 4,
  limit: 5,
})

// Debug logging (development only)
logger.debug('Processing quiz data', { step: 'validation' })
```

### Log Output Examples

**Development (human-readable)**:
```
[INFO] 10:45:17 am - Quiz created successfully
  Context: {
    "quizId": "abc123",
    "category": "science",
    "questionCount": 10
  }

[ERROR] 10:45:18 am - Failed to save quiz
  Context: {
    "quizId": "xyz789",
    "operation": "INSERT"
  }
  Error: DatabaseError: Database connection failed
  Stack: DatabaseError: Database connection failed
    at saveQuiz (...)
```

**Production (JSON)**:
```json
{"level":"info","message":"Quiz created successfully","timestamp":"2024-01-15T10:45:17.123Z","context":{"quizId":"abc123","category":"science","questionCount":10}}
{"level":"error","message":"Failed to save quiz","timestamp":"2024-01-15T10:45:18.456Z","context":{"quizId":"xyz789","operation":"INSERT"},"error":{"name":"DatabaseError","message":"Database connection failed"}}
```

### API Reference

#### `logger.debug(message, context?)`
Log a debug message (development only, skipped in production).

#### `logger.info(message, context?)`
Log an informational message.

#### `logger.warn(message, context?)`
Log a warning message.

#### `logger.error(message, error?, context?)`
Log an error message with optional Error object.

#### `logger.logRequest(request, response, durationMs)`
Log an API request with method, path, status code, and duration.

### Requirements Satisfied

- **6.2**: Logs errors with timestamp, endpoint, and stack trace
- **6.3**: Returns generic error messages to clients (no internal details exposed)
- **6.7**: Logs all API requests with method, path, status code, and response time
- **6.8**: Provides structured logging in JSON format for production environments

## Health Checks

Health check functionality will be implemented in `health.ts` (Task 3.1).

## Error Handler

The `handleApiError` function provides centralized error handling for all API routes, mapping error types to appropriate HTTP status codes and ensuring security best practices.

### Features

- **Automatic error classification**: Maps error types to appropriate HTTP status codes
- **Security-first**: Hides stack traces and internal details in production
- **Comprehensive logging**: Logs all errors with full context for debugging
- **Custom error types**: Predefined error classes for common scenarios
- **Retry-After support**: Automatically sets Retry-After header for rate limiting

### Custom Error Types

#### ValidationError (400 Bad Request)
For input validation failures with optional field-level error details.

```typescript
throw new ValidationError('Invalid input', {
  title: 'Title must be at least 3 characters',
  category: 'Category is required'
})
```

#### AuthenticationError (401 Unauthorized)
For missing or invalid authentication credentials.

```typescript
throw new AuthenticationError('Invalid or expired token')
```

#### AuthorizationError (403 Forbidden)
For insufficient permissions.

```typescript
throw new AuthorizationError('Admin access required')
```

#### RateLimitError (429 Too Many Requests)
For rate limit violations with optional retry-after seconds.

```typescript
throw new RateLimitError('Too many requests', 60)
```

#### DatabaseError (500 Internal Server Error)
For database operation failures, wrapping the original error.

```typescript
throw new DatabaseError('Failed to create quiz', supabaseError)
```

### Usage

```typescript
import { 
  handleApiError, 
  ValidationError,
  AuthenticationError,
  DatabaseError 
} from '@/lib/monitoring/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.title || body.title.length < 3) {
      throw new ValidationError('Title must be at least 3 characters', {
        title: 'Title is too short'
      })
    }
    
    // Authentication
    const token = request.headers.get('authorization')
    if (!token) {
      throw new AuthenticationError('Missing authentication token')
    }
    
    // Database operation
    const { data, error } = await supabase.from('quizzes').insert(body)
    if (error) {
      throw new DatabaseError('Failed to create quiz', error)
    }
    
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    // Centralized error handling
    return handleApiError(error, request)
  }
}
```

### Error Response Format

All errors return a consistent JSON format:

```typescript
{
  error: string,           // User-friendly error message
  code: string,            // Machine-readable error code
  details?: unknown        // Only included in development mode
}
```

### Status Code Mapping

| Error Type | Status Code | Code |
|------------|-------------|------|
| ValidationError | 400 | VALIDATION_ERROR |
| AuthenticationError | 401 | AUTH_ERROR |
| AuthorizationError | 403 | FORBIDDEN |
| RateLimitError | 429 | RATE_LIMIT_EXCEEDED |
| DatabaseError | 500 | DATABASE_ERROR |
| Generic Error | 500 | SERVER_ERROR |

### Security Features

- **Stack traces are never exposed in production**
- **Internal error details are hidden from clients**
- **All errors are logged with full context for debugging**
- **Generic error messages prevent information leakage**
- **Development mode includes details for easier debugging**

### Examples

#### Basic Error Handling
```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData()
    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error, request)
  }
}
```

#### Multiple Error Types
```typescript
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')
    if (!token) {
      throw new AuthenticationError()
    }
    
    // Validate input
    const body = await request.json()
    if (!body.id) {
      throw new ValidationError('ID is required', { id: 'Missing ID field' })
    }
    
    // Check authorization
    const user = await getCurrentUser(token)
    const resource = await getResource(body.id)
    if (resource.ownerId !== user.id) {
      throw new AuthorizationError('You can only edit your own resources')
    }
    
    // Update database
    const { data, error } = await supabase
      .from('resources')
      .update(body)
      .eq('id', body.id)
    
    if (error) {
      throw new DatabaseError('Failed to update resource', error)
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error, request)
  }
}
```

See `error-handler.usage-example.ts` for more comprehensive examples.

### Requirements Satisfied

- **6.1**: Catches unhandled errors in API endpoints
- **6.4**: Hides internal error details and stack traces from clients
- **6.5**: Logs database errors and returns HTTP 500
- **6.6**: Returns HTTP 400 for validation errors with details

### Implementation Notes

- The error handler automatically detects the environment (production vs development)
- Stack traces and internal details are only exposed in development mode
- All errors are logged before returning responses to clients
- Retry-After header is automatically set for RateLimitError
- Unknown error types are handled gracefully as generic server errors
- Error logging includes request context (method, path) for debugging
