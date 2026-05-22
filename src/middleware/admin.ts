import { createMiddleware } from '@tanstack/react-start'
import type { UserSession } from '@/types/auth'
import { getSessionUser, useAppSession } from '@/lib/auth/auth'

export const adminMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    let user: UserSession | null = null
    try {
      const session = await useAppSession()
      user = await getSessionUser(session.data.sessionToken)
    } catch {
      // If session resolution fails, continue with null user
    }

    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    return next({ context: { user } })
  },
)
