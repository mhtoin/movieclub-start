import { createMiddleware } from '@tanstack/react-start'
import { authMiddleware } from './auth'
import { canAccessAdminPanel } from '@/lib/auth/permissions'

export const adminMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const user = context.user
    if (!user || !canAccessAdminPanel(user.role)) {
      throw new Error('Unauthorized')
    }

    return next({ context: { user } })
  })
