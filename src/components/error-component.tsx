import { Button } from './ui/button'
import type { ErrorComponentProps } from '@tanstack/react-router'

const DB_ERROR_PATTERNS = [
  'Failed query',
  'ECONNREFUSED',
  'connection',
  'relation',
  'database',
]

const RATE_LIMIT_MESSAGES = ['Too many attempts', 'rate limit', '429']

function classifyError(error: Error | undefined): {
  type: 'database' | 'rate-limit' | 'not-found' | 'unauthorized' | 'generic'
  userMessage: string
  detail: string
} {
  const msg = error?.message ?? ''

  if (DB_ERROR_PATTERNS.some((p) => msg.includes(p))) {
    return {
      type: 'database',
      userMessage: 'Service temporarily unavailable',
      detail:
        'We\u2019re having trouble connecting to our services. This is usually temporary.',
    }
  }

  if (RATE_LIMIT_MESSAGES.some((p) => msg.toLowerCase().includes(p))) {
    return {
      type: 'rate-limit',
      userMessage: 'Too many requests',
      detail:
        'You\u2019ve made too many attempts. Please wait a moment and try again.',
    }
  }

  if (msg.includes('404') || msg.includes('Not Found')) {
    return {
      type: 'not-found',
      userMessage: 'Page not found',
      detail:
        'The page you\u2019re looking for doesn\u2019t exist or has been moved.',
    }
  }

  if (
    msg.includes('401') ||
    msg.includes('403') ||
    msg.includes('Unauthorized')
  ) {
    return {
      type: 'unauthorized',
      userMessage: 'Access denied',
      detail:
        "You don't have permission to view this page. Try signing in again.",
    }
  }

  return {
    type: 'generic',
    userMessage: 'Something went wrong',
    detail:
      'An unexpected error occurred. Please try again or go back to the home page.',
  }
}

export function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const { type, userMessage, detail } = classifyError(error)

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background px-4"
      role="alert"
    >
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="h-6 w-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{userMessage}</h1>
        </div>

        <div className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground">{detail}</p>
          </div>

          {type === 'database' && process.env.NODE_ENV === 'development' && (
            <div className="rounded-md bg-muted p-4">
              <p className="text-xs font-semibold text-muted-foreground">
                Development hint:
              </p>
              <code className="mt-1 block text-xs text-foreground">
                pnpm db:start
              </code>
            </div>
          )}

          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-muted p-2 text-xs">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={reset} className="flex-1" variant="default">
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            className="flex-1"
            variant="outline"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}
