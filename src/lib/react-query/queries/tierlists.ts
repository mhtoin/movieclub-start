import { db } from '@/db/db'
import { movie, moviesOnTiers, tier, tierlist, user } from '@/db/schema'
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
type User = InferSelectModel<typeof user>

export type UserWithTierlists = User & {
  tierlists: Array<
    Tierlist & {
      tiers: Array<Tier & { moviesOnTiers: MovieOnTier[] }>
    }
  >
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
    getKey: (tierlist: { id: string }) => tierlist.id,
  }),
)

export const electricTierlistCollection = createCollection(
  electricCollectionOptions({
    id: `tierlists`,
    getKey: (item: any) => item.id,
    shapeOptions: {
      url:
        import.meta.env.VITE_ELECTRIC_URL || `http://localhost:3000/v1/shape`,
      params: {
        table: 'tierlist',
      },
      onError: (error) => {
        console.error('Electric tierlist collection sync error:', error)
      },
    },
  }),
)

export const electricTierCollection = createCollection(
  electricCollectionOptions({
    id: `tiers`,
    getKey: (item: any) => item.id,
    shapeOptions: {
      url:
        import.meta.env.VITE_ELECTRIC_URL || `http://localhost:3000/v1/shape`,
      params: {
        table: 'tier',
      },
      onError: (error) => {
        console.error('Electric tier collection sync error:', error)
      },
    },
  }),
)

export const electricMoviesOnTiersCollection = createCollection(
  electricCollectionOptions({
    id: `movies_on_tiers`,
    getKey: (item: any) => item.id,
    shapeOptions: {
      url:
        import.meta.env.VITE_ELECTRIC_URL || `http://localhost:3000/v1/shape`,
      params: {
        table: 'movies_on_tiers',
      },
      onError: (error) => {
        console.error('Electric movies_on_tiers collection sync error:', error)
      },
    },
    onUpdate: async ({ transaction }) => {
      // Process ALL mutations in a single batch, not just the first one
      const updates = transaction.mutations.map((m) => ({
        movieOnTierId: m.modified.id,
        newPosition: m.modified.position,
        tierId: m.modified.tierId,
      }))

      const result = await batchUpdateTierMoviePositions({ data: updates })
      return { txid: Number(result.txid) }
    },
    onInsert: async ({ transaction }) => {
      const inserts = transaction.mutations.map((m) => ({
        movieId: m.modified.movieId,
        position: m.modified.position,
        tierId: m.modified.tierId,
      }))

      const result = await batchInsertMoviesOnTiers({ data: inserts })
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

  const rankedMovieIds = useMemo(() => {
    if (!results) return new Set<string>()

    return new Set(
      results
        .map(
          (result) => (result.movieOnTier as MovieOnTier | undefined)?.movieId,
        )
        .filter((id): id is string => Boolean(id)),
    )
  }, [results])

  // Get all movies
  const { data: allMovies } = useLiveQuery((q) => {
    return q.from({ electricMovieCollection })
  })

  // Filter to get unranked movies (movies not in any tier of this tierlist)
  const unrankedMovies = useMemo(() => {
    if (!allMovies) return []

    const tierlist = results?.[0]?.electricTierlistCollection as Tierlist
    if (!tierlist) return []

    const tierlistFromDate = tierlist.watchDateFrom
    const tierlistToDate = tierlist.watchDateTo

    return allMovies
      .filter((movie): movie is Movie => Boolean(movie))
      .filter(
        (movie) =>
          !rankedMovieIds.has(movie.id) &&
          movie.watchDate !== null &&
          (tierlistFromDate
            ? new Date(movie.watchDate!) >= new Date(tierlistFromDate)
            : true) &&
          (tierlistToDate
            ? new Date(movie.watchDate!) <= new Date(tierlistToDate)
            : true) &&
          (tierlist.genres && tierlist.genres.length > 0
            ? movie.genres
              ? tierlist.genres.some((genre) => movie.genres!.includes(genre))
              : false
            : true),
      )
  }, [allMovies, rankedMovieIds])

  const tierlist = useMemo((): TierlistWithTiers | null => {
    if (!results || results.length === 0) return null

    const tierlistData = results[0].electricTierlistCollection as Tierlist
    const tiersMap = new Map<string, TierWithMovies>()

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
      }
    })

    const sortedTiers = Array.from(tiersMap.values())
      .map((tier) => ({
        ...tier,
        movies: [...tier.movies].sort((a, b) => a.position - b.position),
      }))
      .sort((a, b) => a.value - b.value)

    const unrankedTier: TierWithMovies = {
      id: 'unranked',
      label: 'Unranked',
      value: 0,
      tierlistId: tierlistData.id,
      movies: unrankedMovies.map((movie, index) => ({
        ...movie,
        position: index,
        movieOnTierId: `unranked-${movie.id}`,
      })),
    }

    return {
      ...tierlistData,
      tiers: [unrankedTier, ...sortedTiers],
    }
  }, [results, unrankedMovies])

  return tierlist
}
