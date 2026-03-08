import { db } from '@/db/db'
import { movieToShortlist, raffle, raffleToUser, shortlist } from '@/db/schema'
import { movie } from '@/db/schema/movies'
import { user } from '@/db/schema/users'
import { requireAuthenticatedUser } from '@/lib/auth/auth'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'

export const getParticipatingShortlists = createServerFn({
  method: 'GET',
}).handler(async () => {
  await requireAuthenticatedUser()

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
  history: () =>
    queryOptions({
      queryKey: ['raffle', 'history'],
      queryFn: async () => {
        const result = await getRaffleHistory()
        return result
      },
    }),
}

export const getRaffleHistory = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAuthenticatedUser()

    try {
      const rows = await db
        .select()
        .from(raffle)
        .leftJoin(movie, eq(raffle.winningMovieId, movie.id))
        .leftJoin(raffleToUser, eq(raffleToUser.a, raffle.id))
        .leftJoin(user, eq(raffleToUser.b, user.id))
        .orderBy(desc(raffle.raffledAt))
      const seen = new Set<string>()
      return rows
        .filter((r) => {
          if (seen.has(r.raffle.id)) return false
          seen.add(r.raffle.id)
          return true
        })
        .map((r) => ({
          id: r.raffle.id,
          date: r.raffle.raffledAt,
          movie: r.movie ?? null,
          winner: r.user ?? null,
        }))
    } catch (error) {
      console.error('Error fetching raffle history:', error)
      return []
    }
  },
)
