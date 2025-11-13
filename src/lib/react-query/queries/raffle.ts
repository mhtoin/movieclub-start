import { db } from '@/db/db'
import { movieToShortlist, shortlist } from '@/db/schema'
import { movie } from '@/db/schema/movies'
import { user } from '@/db/schema/users'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'

export const getParticipatingShortlists = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    // Get all shortlists that are ready and participating
    const participatingShortlists = await db
      .select()
      .from(shortlist)
      .where(
        and(eq(shortlist.isReady, true), eq(shortlist.participating, true)),
      )
      .innerJoin(user, eq(shortlist.userId, user.id))
      .innerJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .innerJoin(movie, eq(movieToShortlist.a, movie.id))

    // Transform into a useful structure
    const shortlistsMap = new Map()

    for (const row of participatingShortlists) {
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
    console.error('Error fetching participating shortlists:', error)
    return []
  }
})

export const raffleQueries = {
  participating: () =>
    queryOptions({
      queryKey: ['raffle', 'participating'],
      queryFn: async () => {
        const result = await getParticipatingShortlists()
        return result
      },
    }),
}
