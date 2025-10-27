import { db } from '@/db/db'
import { movieToShortlist, shortlist } from '@/db/schema'
import { movie } from '@/db/schema/movies'
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
        .limit(1)

      if (!userShortlist || userShortlist.length === 0) {
        return {
          shortlist: null,
          movies: [],
        }
      }

      const shortlistData = userShortlist[0]
      const shortlistMovies = await db
        .select({
          movie: movie,
        })
        .from(movieToShortlist)
        .innerJoin(movie, eq(movie.id, movieToShortlist.a))
        .where(eq(movieToShortlist.b, shortlistData.id))

      return {
        shortlist: shortlistData,
        movies: shortlistMovies.map(item => item.movie),
      }
    } catch (error) {
      console.error('Error fetching shortlist:', error)
      return {
        shortlist: null,
        movies: [],
      }
    }
  })

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
}
