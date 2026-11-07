import { createMiddleware, createStart } from '@tanstack/react-start'
import { authMiddleware } from '@/middleware/auth'
import {
  isThrownResponse,
  logUnexpectedRequestError,
} from '@/lib/server/logger'

/**
 * Emits a structured diagnostic to stderr when request handling throws an
 * unexpected error, then rethrows so TanStack Start's normal error handling is
 * unchanged. Thrown `Response` values (redirects and other control flow) are
 * skipped deliberately.
 */
const requestErrorLoggingMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ request, pathname, next }) => {
  try {
    return await next()
  } catch (error) {
    if (!isThrownResponse(error)) {
      logUnexpectedRequestError({ request, pathname, error })
    }
    throw error
  }
})

/**
 * TanStack Start application entry-point configuration.
 *
 * `functionMiddleware` runs for every server function in the app.
 * Registering `authMiddleware` here means the session cookie is decrypted and
 * the user is resolved exactly once per HTTP request cycle, regardless of how
 * many server functions are called during that cycle (SSR prefetches, etc.).
 */
export const startInstance = createStart(() => ({
  requestMiddleware: [requestErrorLoggingMiddleware],
  functionMiddleware: [authMiddleware],
}))
