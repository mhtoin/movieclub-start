import { db } from '@/db/db'
import { movie, moviesOnTiers, tier, tierlist, user } from '@/db/schema'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { eq as dbEq, InferSelectModel, sql } from 'drizzle-orm'
import { useMemo } from 'react'
import { movieQueries } from './movies'

type Tierlist = InferSelectModel<typeof tierlist>
type Tier = InferSelectModel<typeof tier>
type MovieOnTier = InferSelectModel<typeof moviesOnTiers>
type Movie = InferSelectModel<typeof movie>
type User = InferSelectModel<typeof user>

export type UserWithTierlists = User & {
  tierlists: Array<
    Tierlist & {
      tiers: Array<Tier & { moviesOnTiers: MovieOnTier[] }>
    }
  >
}

export type TierlistWithDetails = Tierlist & {
  tiers: Array<Tier & { moviesOnTiers: Array<MovieOnTier & { movie: Movie }> }>
}

export interface TierWithMovies extends Tier {
  movies: (Movie & { position: number; movieOnTierId: string })[]
}

interface TierlistWithTiers extends Tierlist {
  tiers: TierWithMovies[]
}

export const updateTierMoviePosition = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { movieOnTierId: string; newPosition: number; tierId?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const { movieOnTierId, newPosition, tierId } = data
    const id = movieOnTierId as (typeof moviesOnTiers.$inferSelect)['id']

    const txid = await db.transaction(async (tx) => {
      const updateData: { position: number; tierId?: string } = {
        position: newPosition,
      }
      if (tierId) {
        updateData.tierId = tierId
      }

      await tx
        .update(moviesOnTiers)
        .set(updateData)
        .where(dbEq(moviesOnTiers.id, id))

      const [{ txid }] = (await tx.execute(
        sql`select txid_current() as txid`,
      )) as Array<{ txid: unknown }>
      return txid as string
    })

    return { txid }
  })

export const batchUpdateTierMoviePositions = createServerFn({ method: 'POST' })
  .inputValidator(
    (
      data: Array<{
        movieOnTierId: string
        newPosition: number
        tierId: string
      }>,
    ) => data,
  )
  .handler(async ({ data }) => {
    if (data.length === 0) return { txid: 0 }

    const txid = await db.transaction(async (tx) => {
      for (const update of data) {
        const id =
          update.movieOnTierId as (typeof moviesOnTiers.$inferSelect)['id']
        await tx
          .update(moviesOnTiers)
          .set({ position: update.newPosition, tierId: update.tierId })
          .where(dbEq(moviesOnTiers.id, id))
      }

      const [{ txid }] = (await tx.execute(
        sql`select txid_current() as txid`,
      )) as Array<{ txid: unknown }>
      return txid as string
    })

    return { txid }
  })

export const batchInsertMoviesOnTiers = createServerFn({ method: 'POST' })
  .inputValidator(
    (
      data: Array<{
        movieId: string
        tierId: string
        position: number
      }>,
    ) => data,
  )
  .handler(async ({ data }) => {
    if (data.length === 0) return { txid: 0 }

    const txid = await db.transaction(async (tx) => {
      for (const insert of data) {
        await tx.insert(moviesOnTiers).values({
          id: `movieOnTier-${crypto.randomUUID()}`,
          movieId: insert.movieId,
          tierId: insert.tierId,
          position: insert.position,
        })
      }

      const [{ txid }] = (await tx.execute(
        sql`select txid_current() as txid`,
      )) as Array<{ txid: unknown }>
      return txid as string
    })

    return { txid }
  })

export const getTierlists = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const users = await (db as any).query.user.findMany({
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
      return users.filter((u: UserWithTierlists) => u.tierlists.length > 0)
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
      const userTierlists = await (db as any).query.tierlist.findMany({
        where: (tierlist: any, { eq }: any) => eq(tierlist.userId, userId),
        with: {
          tiers: {
            with: {
              moviesOnTiers: {
                with: {
                  movie: true,
                },
              },
            },
            orderBy: (tiers: any, { asc }: any) => [asc(tiers.value)],
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
    queryOptions<TierlistWithDetails[]>({
      queryKey: ['tierlists', 'user', userId],
      queryFn: () => getUserTierlists({ data: userId }),
    }),
}

export const useTierlistLiveQuery = (
  userId: string,
  tierlistId: string,
): TierlistWithTiers | null => {
  const { data: tierlists } = useSuspenseQuery(tierlistQueries.user(userId))
  const { data: allMovies } = useSuspenseQuery(movieQueries.allWatched())

  return useMemo(() => {
    if (!tierlists || tierlists.length === 0) return null

    const tierlistData = tierlists.find((t) => t.id === tierlistId)
    if (!tierlistData) return null

    // Build ranked tier map and collect ranked movie IDs
    const rankedMovieIds = new Set<string>()
    const tiersMap = new Map<string, TierWithMovies>()

    for (const t of tierlistData.tiers) {
      const movies = t.moviesOnTiers
        .map((mot) => ({
          ...mot.movie,
          position: mot.position,
          movieOnTierId: mot.id,
        }))
        .sort((a, b) => a.position - b.position)
      tiersMap.set(t.id, { ...t, movies })
      for (const mot of t.moviesOnTiers) {
        rankedMovieIds.add(mot.movieId)
      }
    }

    const sortedTiers = Array.from(tiersMap.values()).sort(
      (a, b) => a.value - b.value,
    )

    // Compute unranked: watched movies not yet in any tier of this tierlist
    const { watchDateFrom, watchDateTo, genres } = tierlistData

    const unrankedMovies = (allMovies ?? []).filter((m) => {
      if (rankedMovieIds.has(m.id)) return false
      if (!m.watchDate) return false
      if (watchDateFrom && new Date(m.watchDate) < new Date(watchDateFrom))
        return false
      if (watchDateTo && new Date(m.watchDate) > new Date(watchDateTo))
        return false
      if (genres && genres.length > 0) {
        if (!m.genres) return false
        if (!genres.some((g) => m.genres!.includes(g))) return false
      }
      return true
    })

    const unrankedTier: TierWithMovies = {
      id: 'unranked',
      label: 'Unranked',
      value: 0,
      tierlistId: tierlistData.id,
      movies: unrankedMovies.map((m, index) => ({
        ...m,
        position: index,
        movieOnTierId: `unranked-${m.id}`,
      })),
    }

    return {
      ...tierlistData,
      tiers: [unrankedTier, ...sortedTiers],
    }
  }, [tierlists, allMovies, tierlistId])
}
