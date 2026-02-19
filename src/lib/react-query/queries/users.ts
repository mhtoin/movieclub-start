import { db } from '@/db/db'
import { user } from '@/db/schema/users'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

export const getUsers = createServerFn({ method: 'GET' }).handler(async () => {
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
