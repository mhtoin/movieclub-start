import { ErrorComponentProps } from '@tanstack/react-router'
import { Button } from './ui/button'

export function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const isDatabaseError =
    error?.message?.includes('Failed query') ||
    error?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('connection')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="h-6 w-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isDatabaseError
              ? 'Database Connection Error'
              : 'Something went wrong'}
          </h1>
        </div>

        <div className="space-y-4">
          {/* This is mostly for myself for when I forget to start the db */}
          {isDatabaseError ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Unable to connect to the database. This usually happens when:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>The database server is not running</li>
                <li>Database connection configuration is incorrect</li>
                <li>Network connectivity issues</li>
              </ul>
              <div className="mt-4 rounded-md bg-muted p-4">
                <p className="text-xs font-semibold text-muted-foreground">
                  Try running:
                </p>
                <code className="mt-1 block text-xs text-foreground">
                  pnpm db:start
                </code>
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                {error?.message || 'An unexpected error occurred'}
              </p>
            </div>
          )}

          {process.env.NODE_ENV === 'development' && error?.stack && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-2 text-xs">
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
