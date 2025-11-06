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
