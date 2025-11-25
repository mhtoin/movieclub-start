import { db } from '@/db/db'
import { movie, moviesOnTiers, tier, tierlist } from '@/db/schema'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { createCollection, eq, useLiveQuery } from '@tanstack/react-db'
import { QueryClient, queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { eq as dbEq, InferSelectModel, sql } from 'drizzle-orm'
import { useMemo } from 'react'
import { electricMovieCollection } from './movies'

const queryClient = new QueryClient()
type Tierlist = InferSelectModel<typeof tierlist>
type Tier = InferSelectModel<typeof tier>
type MovieOnTier = InferSelectModel<typeof moviesOnTiers>
type Movie = InferSelectModel<typeof movie>

export interface TierWithMovies extends Tier {
  movies: (Movie & { position: number; movieOnTierId: string })[]
}

interface TierlistWithTiers extends Tierlist {
  tiers: TierWithMovies[]
}

export const updateTierMoviePosition = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { movieOnTierId: string; newPosition: number }) => data,
  )
  .handler(async ({ data }) => {
    const { movieOnTierId, newPosition } = data
    const tierId = movieOnTierId as (typeof moviesOnTiers.$inferSelect)['id']

    const txid = await db.transaction(async (tx) => {
      await tx
        .update(moviesOnTiers)
        .set({ position: newPosition })
        .where(dbEq(moviesOnTiers.id, tierId))

      const [{ txid }] = await tx.execute(sql`select txid_current() as txid`)
      return txid as string
    })

    return { txid }
  })

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

export const tierlistQueryCollection = createCollection(
  queryCollectionOptions({
    // Build a dynamic key using the LoadSubsetOptions (opts) argument
    queryKey: (opts) => {
      const userId =
        (opts as any).queryArgs?.userId ?? (opts as any).queryArgs?.[0] ?? ''
      return ['tierlists', 'user', userId]
    },
    queryFn: async ({ queryKey }) => {
      const [, , userId] = queryKey as [string, string, string]
      return getUserTierlists({ data: userId })
    },
    queryClient,
    getKey: (tierlist) => tierlist.id,
  }),
)

export const electricTierlistCollection = createCollection(
  electricCollectionOptions({
    id: `tierlists`,
    getKey: (item: any) => item.id,
    shapeOptions: {
      url: `http://localhost:3000/v1/shape`,
      params: {
        table: 'tierlist',
      },
    },
  }),
)

export const electricTierCollection = createCollection(
  electricCollectionOptions({
    id: `tiers`,
    getKey: (item: any) => item.id,
    shapeOptions: {
      url: `http://localhost:3000/v1/shape`,
      params: {
        table: 'tier',
      },
    },
  }),
)

export const electricMoviesOnTiersCollection = createCollection(
  electricCollectionOptions({
    id: `movies_on_tiers`,
    getKey: (item: any) => item.id,
    shapeOptions: {
      url: `http://localhost:3000/v1/shape`,
      params: {
        table: 'movies_on_tiers',
      },
    },
    onUpdate: async ({ transaction }) => {
      const { modified } = transaction.mutations[0]

      const result = await updateTierMoviePosition({
        data: {
          movieOnTierId: modified.id,
          newPosition: modified.position,
        },
      })

      return { txid: Number(result.txid) }
    },
  }),
)

export const useTierlistLiveQuery = (userId: string, tierlistId: string) => {
  const { data: results } = useLiveQuery((q) => {
    return q
      .from({ electricTierlistCollection })
      .where(({ electricTierlistCollection }) =>
        eq(electricTierlistCollection.userId, userId),
      )
      .where(({ electricTierlistCollection }) =>
        eq(electricTierlistCollection.id, tierlistId),
      )
      .join(
        { tier: electricTierCollection },
        ({ electricTierlistCollection, tier }) =>
          eq(tier.tierlistId, electricTierlistCollection.id),
      )
      .join(
        { movieOnTier: electricMoviesOnTiersCollection },
        ({ tier, movieOnTier }) => eq(movieOnTier.tierId, tier.id),
      )
      .join({ movie: electricMovieCollection }, ({ movieOnTier, movie }) =>
        eq(movieOnTier.movieId, movie.id),
      )
  })

  return useMemo((): TierlistWithTiers | null => {
    if (!results || results.length === 0) return null

    const tierlistData = results[0].electricTierlistCollection as Tierlist
    const tiersMap = new Map<string, TierWithMovies>()
    const rankedMovieIds = new Set<string>()

    results.forEach((result) => {
      const tier = result.tier as Tier
      const movieOnTier = result.movieOnTier as MovieOnTier
      const movie = result.movie as Movie

      if (!tier) return

      if (!tiersMap.has(tier.id)) {
        tiersMap.set(tier.id, { ...tier, movies: [] })
      }
      if (movie && movieOnTier) {
        tiersMap.get(tier.id)!.movies.push({
          ...movie,
          position: movieOnTier.position,
          movieOnTierId: movieOnTier.id,
        })
        rankedMovieIds.add(movie.id)
      }
    })

    // Sort movies in tiers
    tiersMap.forEach((tier) => {
      tier.movies.sort((a, b) => a.position - b.position)
    })

    return {
      ...tierlistData,
      tiers: Array.from(tiersMap.values()).sort((a, b) => a.value - b.value),
    }
  }, [results])
}
