import { getSessionUser, useAppSession } from '@/lib/auth/auth'
import type { UserSession } from '@/types/auth'
import { createMiddleware } from '@tanstack/react-start'

/**
 * Server-function middleware that resolves the current session user once per
 * function invocation and makes it available via `context.user`.
 */
export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    let user: UserSession | null = null
    try {
      const session = await useAppSession()
      user = await getSessionUser(session.data?.sessionToken)
    } catch {
      // If session resolution fails (e.g. missing env var in test) continue
      // with a null user so individual handlers can decide what to do.
    }
    return next({ context: { user } })
  },
)
