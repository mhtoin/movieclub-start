import { authMiddleware } from '@/middleware/auth'
import { createStart } from '@tanstack/react-start'

/**
 * TanStack Start application entry-point configuration.
 *
 * `functionMiddleware` runs for every server function in the app.
 * Registering `authMiddleware` here means the session cookie is decrypted and
 * the user is resolved exactly once per HTTP request cycle, regardless of how
 * many server functions are called during that cycle (SSR prefetches, etc.).
 */
export const startInstance = createStart(() => ({
  functionMiddleware: [authMiddleware],
}))
