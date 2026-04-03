import { db } from '@/db/db'
import { raffle, raffleToUser } from '@/db/schema/raffles'
import { authMiddleware } from '@/middleware/auth'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'

export interface RaffleStats {
  totalRaffles: number
  userParticipations: number
  userWins: number
  winRate: number
  raffleHistory: RaffleParticipationBucket[]
}

export interface RaffleParticipationBucket {
  month: string
  entries: number
  wins: number
}

export const getRaffleStats = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<RaffleStats> => {
    if (!context.user) throw new Error('Unauthorized')

    try {
      const userId = context.user.userId

      const allRaffles = await db
        .select()
        .from(raffle)
        .leftJoin(raffleToUser, eq(raffleToUser.a, raffle.id))
        .orderBy(desc(raffle.raffledAt))

      const totalRaffles = allRaffles.length

      const userParticipations = allRaffles.filter(
        (r) => r._raffle_to_user?.b === userId,
      ).length

      const userWins = allRaffles.filter(
        (r) =>
          r._raffle_to_user?.b === userId && r.raffle?.winningMovieId !== null,
      ).length

      const winRate =
        userParticipations > 0
          ? Math.round((userWins / userParticipations) * 100)
          : 0

      const entriesByMonth = new Map<string, number>()
      const winsByMonth = new Map<string, number>()

      allRaffles.forEach((r) => {
        if (r.raffle?.raffledAt) {
          const month = r.raffle.raffledAt.toISOString().substring(0, 7)
          if (r._raffle_to_user?.b === userId) {
            entriesByMonth.set(month, (entriesByMonth.get(month) || 0) + 1)
            if (r.raffle?.winningMovieId) {
              winsByMonth.set(month, (winsByMonth.get(month) || 0) + 1)
            }
          }
        }
      })

      const allMonths = new Set([
        ...entriesByMonth.keys(),
        ...winsByMonth.keys(),
      ])
      const raffleHistory: RaffleParticipationBucket[] = Array.from(allMonths)
        .sort()
        .reverse()
        .slice(0, 12)
        .map((month) => ({
          month,
          entries: entriesByMonth.get(month) || 0,
          wins: winsByMonth.get(month) || 0,
        }))
        .reverse()

      return {
        totalRaffles,
        userParticipations,
        userWins,
        winRate,
        raffleHistory,
      }
    } catch (error) {
      console.error('Error fetching raffle stats:', error)
      return {
        totalRaffles: 0,
        userParticipations: 0,
        userWins: 0,
        winRate: 0,
        raffleHistory: [],
      }
    }
  })

export const raffleStatsQueries = {
  stats: () =>
    queryOptions({
      queryKey: ['raffle', 'stats'],
      queryFn: getRaffleStats,
    }),
}
