import { db } from '@/db/db'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

export const getTierlists = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const users = await db.query.user.findMany({
        with: {
          tierlists: {
            with: {
              tiers: {
                with: {
                  moviesOnTiers: true,
                },
              },
            },
          },
        },
      })
      return users.filter((u) => u.tierlists.length > 0)
    } catch (error) {
      console.error('Error fetching tierlists:', error)
      throw error
    }
  },
)

export const getUserTierlists = createServerFn({ method: 'GET' })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    try {
      const userTierlists = await db.query.tierlist.findMany({
        where: (tierlist, { eq }) => eq(tierlist.userId, userId),
        with: {
          tiers: {
            with: {
              moviesOnTiers: true,
            },
            orderBy: (tiers, { asc }) => [asc(tiers.value)],
          },
        },
      })
      return userTierlists
    } catch (error) {
      console.error('Error fetching user tierlists:', error)
      throw error
    }
  })

export const tierlistQueries = {
  all: () =>
    queryOptions({
      queryKey: ['tierlists', 'all'],
      queryFn: getTierlists,
    }),
  user: (userId: string) =>
    queryOptions({
      queryKey: ['tierlists', 'user', userId],
      queryFn: () => getUserTierlists({ data: userId }),
    }),
}
