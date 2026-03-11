import { db } from '@/db/db'
import { user } from '@/db/schema/users'
import { authMiddleware } from '@/middleware/auth'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

export const getUsers = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.user) throw new Error('Unauthorized')

    try {
      const users = await db
        .select({
          id: user.id,
          name: user.name,
        })
        .from(user)
      return users
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  })

export const userQueries = {
  all: () =>
    queryOptions({
      queryKey: ['users', 'all'],
      queryFn: getUsers,
    }),
}
