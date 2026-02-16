import { db } from '@/db/db'
import type { ShortlistWithUserMovies } from '@/db/schema'
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
      const rows = await db
        .select()
        .from(shortlist)
        .where(eq(shortlist.userId, userId))
        .leftJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
        .leftJoin(movie, eq(movieToShortlist.a, movie.id))

      if (rows.length === 0) {
        return null
      }

      return {
        ...rows[0].shortlist,
        movies: rows.flatMap((row) => (row.movie ? [row.movie] : [])),
      }
    } catch (error) {
      console.error('Error fetching shortlist:', error)
      return null
    }
  })

export const getAllShortlists = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ShortlistWithUserMovies[]> => {
    try {
      const allShortlists = await db
        .select()
        .from(shortlist)
        .innerJoin(user, eq(shortlist.userId, user.id))
        .innerJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
        .innerJoin(movie, eq(movieToShortlist.a, movie.id))

      const shortlistsMap = new Map<string, ShortlistWithUserMovies>()

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
          shortlistsMap.get(shortlistId)!.movies.push(row.movie)
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
