import { db } from '@/db/db'
import { movieToShortlist, shortlist } from '@/db/schema'
import { movie } from '@/db/schema/movies'
import { user } from '@/db/schema/users'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

export const getUserShortlist = createServerFn({ method: 'GET' })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    try {
      const userShortlist = await db
        .select()
        .from(shortlist)
        .where(eq(shortlist.userId, userId))
        .innerJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
        .innerJoin(movie, eq(movieToShortlist.a, movie.id))

      // Transform the result into a more useful structure
      const shortlistWithMovies =
        userShortlist.length > 0
          ? {
              ...userShortlist[0].shortlist,
              movies: userShortlist.map((row) => row.movie),
            }
          : null

      if (!shortlistWithMovies) {
        return null
      }

      return shortlistWithMovies
    } catch (error) {
      console.error('Error fetching shortlist:', error)
      return null
    }
  })

export const getAllShortlists = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const allShortlists = await db
        .select()
        .from(shortlist)
        .innerJoin(user, eq(shortlist.userId, user.id))
        .innerJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
        .innerJoin(movie, eq(movieToShortlist.a, movie.id))

      console.log('All Shortlists Raw:', allShortlists)

      const shortlistsMap = new Map()

      for (const row of allShortlists) {
        const shortlistId = row.shortlist.id
        if (!shortlistsMap.has(shortlistId)) {
          shortlistsMap.set(shortlistId, {
            ...row.shortlist,
            user: row.user,
            movies: [],
          })
        }
        if (row.movie) {
          shortlistsMap.get(shortlistId).movies.push(row.movie)
        }
      }

      return Array.from(shortlistsMap.values())
    } catch (error) {
      console.error('Error fetching all shortlists:', error)
      return []
    }
  },
)

export const shortlistQueries = {
  byUser: (userId: string) =>
    queryOptions({
      queryKey: ['shortlist', userId],
      queryFn: async () => {
        const result = await getUserShortlist({ data: userId })
        return result
      },
      enabled: !!userId,
    }),
  all: () =>
    queryOptions({
      queryKey: ['shortlists', 'all'],
      queryFn: async () => {
        const result = await getAllShortlists()
        return result
      },
    }),
}
