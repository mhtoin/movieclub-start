import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import {
  and,
  asc,
  count,
  countDistinct,
  eq as dbEq,
  desc,
  inArray,
  sql,
} from 'drizzle-orm'
import { useMemo } from 'react'
import { z } from 'zod'
import { movieQueries } from './movies'
import type { InferSelectModel } from 'drizzle-orm'
import { authMiddleware } from '@/middleware/auth'
import { movie, moviesOnTiers, tier, tierlist, user } from '@/db/schema'
import { db } from '@/db/db'

type Tierlist = InferSelectModel<typeof tierlist>
type Tier = InferSelectModel<typeof tier>
type MovieOnTier = InferSelectModel<typeof moviesOnTiers>
type Movie = InferSelectModel<typeof movie>
type User = InferSelectModel<typeof user>

export type UserWithTierlists = User & {
  tierlists: Array<
    Tierlist & {
      tiers: Array<
        Tier & { moviesOnTiers: Array<MovieOnTier & { movie: Movie }> }
      >
    }
  >
}

export type TierlistWithDetails = Tierlist & {
  tiers: Array<Tier & { moviesOnTiers: Array<MovieOnTier & { movie: Movie }> }>
}

export interface TierWithMovies extends Tier {
  movies: Array<Movie & { position: number; movieOnTierId: string }>
}

interface TierlistWithTiers extends Tierlist {
  tiers: Array<TierWithMovies>
}

export interface TierlistPreview {
  id: string
  title: string | null
  genres: Array<string> | null
  watchDateFrom: string | null
  watchDateTo: string | null
  tierCount: number
  movieCount: number
  posterPaths: Array<string>
}

export interface UserTierlistSummary {
  id: string
  name: string | null
  image: string | null
  tierlists: Array<TierlistPreview>
}

const updateTierMoviePositionSchema = z.object({
  movieOnTierId: z.string().min(1),
  newPosition: z.number().int().min(0),
  tierId: z.string().min(1).optional(),
})

const batchUpdateTierMoviePositionsSchema = z.array(
  z.object({
    movieOnTierId: z.string().min(1),
    newPosition: z.number().int().min(0),
    tierId: z.string().min(1),
  }),
)

const batchInsertMoviesOnTiersSchema = z.array(
  z.object({
    movieId: z.string().min(1),
    tierId: z.string().min(1),
    position: z.number().int().min(0),
  }),
)

async function assertOwnedTierIds(userId: string, tierIds: Array<string>) {
  const uniqueTierIds = [...new Set(tierIds)]

  if (uniqueTierIds.length === 0) {
    return
  }

  const ownedTiers = await db
    .select({ id: tier.id })
    .from(tier)
    .innerJoin(tierlist, dbEq(tier.tierlistId, tierlist.id))
    .where(and(inArray(tier.id, uniqueTierIds), dbEq(tierlist.userId, userId)))

  if (ownedTiers.length !== uniqueTierIds.length) {
    throw new Error('Forbidden')
  }
}

async function assertOwnedMovieOnTierIds(
  userId: string,
  movieOnTierIds: Array<string>,
) {
  const uniqueMovieOnTierIds = [...new Set(movieOnTierIds)]

  if (uniqueMovieOnTierIds.length === 0) {
    return
  }

  const ownedMovieOnTiers = await db
    .select({ id: moviesOnTiers.id })
    .from(moviesOnTiers)
    .innerJoin(tier, dbEq(moviesOnTiers.tierId, tier.id))
    .innerJoin(tierlist, dbEq(tier.tierlistId, tierlist.id))
    .where(
      and(
        inArray(moviesOnTiers.id, uniqueMovieOnTierIds),
        dbEq(tierlist.userId, userId),
      ),
    )

  if (ownedMovieOnTiers.length !== uniqueMovieOnTierIds.length) {
    throw new Error('Forbidden')
  }
}

export const updateTierMoviePosition = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateTierMoviePositionSchema)
  .handler(async ({ context, data }) => {
    if (!context.user) throw new Error('Unauthorized')
    const currentUser = context.user
    const { movieOnTierId, newPosition, tierId } = data
    const id = movieOnTierId

    await Promise.all([
      assertOwnedMovieOnTierIds(currentUser.userId, [movieOnTierId]),
      assertOwnedTierIds(currentUser.userId, tierId ? [tierId] : []),
    ])

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

      const [result] = (await tx.execute(
        sql`select txid_current() as txid`,
      )) as Array<{ txid: unknown }>
      return result.txid as string
    })

    return { txid }
  })

export const batchUpdateTierMoviePositions = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(batchUpdateTierMoviePositionsSchema)
  .handler(async ({ context, data }) => {
    if (data.length === 0) return { txid: 0 }

    if (!context.user) throw new Error('Unauthorized')
    const currentUser = context.user

    await Promise.all([
      assertOwnedMovieOnTierIds(
        currentUser.userId,
        data.map((update) => update.movieOnTierId),
      ),
      assertOwnedTierIds(
        currentUser.userId,
        data.map((update) => update.tierId),
      ),
    ])

    const txid = await db.transaction(async (tx) => {
      await Promise.all(
        data.map((update) =>
          tx
            .update(moviesOnTiers)
            .set({ position: update.newPosition, tierId: update.tierId })
            .where(dbEq(moviesOnTiers.id, update.movieOnTierId)),
        ),
      )

      const [result] = (await tx.execute(
        sql`select txid_current() as txid`,
      )) as Array<{ txid: unknown }>
      return result.txid as string
    })

    return { txid }
  })

export const batchInsertMoviesOnTiers = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(batchInsertMoviesOnTiersSchema)
  .handler(async ({ context, data }) => {
    if (data.length === 0) return { txid: 0 }

    if (!context.user) throw new Error('Unauthorized')
    const currentUser = context.user

    await assertOwnedTierIds(
      currentUser.userId,
      data.map((insert) => insert.tierId),
    )

    const txid = await db.transaction(async (tx) => {
      await Promise.all(
        data.map((insert) =>
          tx.insert(moviesOnTiers).values({
            id: `movieOnTier-${crypto.randomUUID()}`,
            movieId: insert.movieId,
            tierId: insert.tierId,
            position: insert.position,
          }),
        ),
      )

      const [result] = (await tx.execute(
        sql`select txid_current() as txid`,
      )) as Array<{ txid: unknown }>
      return result.txid as string
    })

    return { txid }
  })

export const getSingleTierlist = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((id: string) => id)
  .handler(async ({ context, data: tierlistId }) => {
    if (!context.user) throw new Error('Unauthorized')

    try {
      const result = await (db as any).query.tierlist.findFirst({
        where: (tl: any, { eq }: any) => eq(tl.id, tierlistId),
        with: {
          tiers: {
            with: {
              moviesOnTiers: {
                with: { movie: true },
              },
            },
            orderBy: (tiers: any, { asc: ascFn }: any) => [ascFn(tiers.value)],
          },
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      return (result as TierlistWithDetails) ?? null
    } catch (error) {
      console.error('Error fetching single tierlist:', error)
      throw error
    }
  })

const TIERLISTS_USER_CAP = 50

export const getTierlists = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.user) throw new Error('Unauthorized')

    try {
      const users = await (db as any).query.user.findMany({
        limit: TIERLISTS_USER_CAP,
        with: {
          tierlists: {
            with: {
              tiers: {
                with: {
                  moviesOnTiers: {
                    with: {
                      movie: true,
                    },
                  },
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
  })

export const getTierlistIndex = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async () => {
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        tierlistId: tierlist.id,
        tierlistTitle: tierlist.title,
        tierlistGenres: tierlist.genres,
        tierlistWatchDateFrom: tierlist.watchDateFrom,
        tierlistWatchDateTo: tierlist.watchDateTo,
        tierCount: countDistinct(tier.id),
        movieCount: count(moviesOnTiers.id),
      })
      .from(user)
      .innerJoin(tierlist, dbEq(user.id, tierlist.userId))
      .leftJoin(tier, dbEq(tierlist.id, tier.tierlistId))
      .leftJoin(moviesOnTiers, dbEq(tier.id, moviesOnTiers.tierId))
      .groupBy(user.id, tierlist.id)
      .orderBy(desc(tierlist.createdAt))

    const tierlistIds = [...new Set(users.map((u) => u.tierlistId))]

    const posterRows =
      tierlistIds.length > 0
        ? await db
            .select({
              tierlistId: tierlist.id,
              images: movie.images,
            })
            .from(moviesOnTiers)
            .innerJoin(tier, dbEq(moviesOnTiers.tierId, tier.id))
            .innerJoin(tierlist, dbEq(tier.tierlistId, tierlist.id))
            .innerJoin(movie, dbEq(moviesOnTiers.movieId, movie.id))
            .where(inArray(tierlist.id, tierlistIds))
            .orderBy(tierlist.id, moviesOnTiers.position)
        : []

    const posterMap: Record<string, Array<string>> = {}
    for (const row of posterRows) {
      const posterPath = (row.images as any)?.posters?.[0]?.file_path
      if (posterPath) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!posterMap[row.tierlistId]) posterMap[row.tierlistId] = []
        if (posterMap[row.tierlistId].length < 4) {
          posterMap[row.tierlistId].push(posterPath)
        }
      }
    }

    const userMap = new Map<string, UserTierlistSummary>()
    const tierlistSeenMap = new Map<string, Set<string>>()

    for (const row of users) {
      if (!userMap.has(row.id)) {
        userMap.set(row.id, {
          id: row.id,
          name: row.name,
          image: row.image,
          tierlists: [],
        })
        tierlistSeenMap.set(row.id, new Set())
      }

      const existing = userMap.get(row.id)!
      const seenTierlists = tierlistSeenMap.get(row.id)!

      if (!seenTierlists.has(row.tierlistId)) {
        seenTierlists.add(row.tierlistId)
        existing.tierlists.push({
          id: row.tierlistId,
          title: row.tierlistTitle,
          genres: row.tierlistGenres,
          watchDateFrom: row.tierlistWatchDateFrom,
          watchDateTo: row.tierlistWatchDateTo,
          tierCount: row.tierCount,
          movieCount: row.movieCount,
          posterPaths: posterMap[row.tierlistId] ?? [],
        })
      }
    }

    return Array.from(userMap.values()).filter((u) => u.tierlists.length > 0)
  })

export const getUserTierlists = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((userId: string) => userId)
  .handler(async ({ context, data: userId }) => {
    if (!context.user) throw new Error('Unauthorized')

    try {
      const userTierlists = await (db as any).query.tierlist.findMany({
        where: (tl: any, { eq }: any) => eq(tl.userId, userId),
        with: {
          tiers: {
            with: {
              moviesOnTiers: {
                with: {
                  movie: true,
                },
              },
            },
            orderBy: (tiers: any, { asc: ascFn }: any) => [ascFn(tiers.value)],
          },
        },
      })
      return userTierlists
    } catch (error) {
      console.error('Error fetching user tierlists:', error)
      throw error
    }
  })

export const getUserTierlistsSummary = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((userId: string) => userId)
  .handler(async ({ context, data: userId }) => {
    if (!context.user) throw new Error('Unauthorized')

    try {
      const userTierlists = await db
        .select({
          id: tierlist.id,
          title: tierlist.title,
          genres: tierlist.genres,
          watchDateFrom: tierlist.watchDateFrom,
          watchDateTo: tierlist.watchDateTo,
          createdAt: tierlist.createdAt,
        })
        .from(tierlist)
        .where(dbEq(tierlist.userId, userId))
        .orderBy(desc(tierlist.createdAt))

      if (userTierlists.length === 0) return []

      const tierlistIds = userTierlists.map((t) => t.id)

      const [tierCountsResult, posterRows, movieCountResult] =
        await Promise.all([
          db
            .select({
              tierlistId: tier.tierlistId,
              count: count(tier.id),
            })
            .from(tier)
            .where(inArray(tier.tierlistId, tierlistIds))
            .groupBy(tier.tierlistId),
          db
            .select({
              tierlistId: tierlist.id,
              images: movie.images,
            })
            .from(moviesOnTiers)
            .innerJoin(tier, dbEq(moviesOnTiers.tierId, tier.id))
            .innerJoin(tierlist, dbEq(tier.tierlistId, tierlist.id))
            .innerJoin(movie, dbEq(moviesOnTiers.movieId, movie.id))
            .where(inArray(tierlist.id, tierlistIds))
            .orderBy(tierlist.id, asc(tier.value), moviesOnTiers.position),
          db
            .select({
              tierlistId: tier.tierlistId,
              count: count(moviesOnTiers.id),
            })
            .from(moviesOnTiers)
            .innerJoin(tier, dbEq(moviesOnTiers.tierId, tier.id))
            .where(inArray(tier.tierlistId, tierlistIds))
            .groupBy(tier.tierlistId),
        ])

      const tierCountMap = new Map<string, number>(
        tierCountsResult.map((r) => [r.tierlistId, r.count]),
      )

      const movieCountMap = new Map<string, number>(
        movieCountResult.map((r) => [r.tierlistId, r.count]),
      )

      const posterMap: Record<string, Array<string>> = {}
      for (const row of posterRows) {
        const posterPath = (row.images as any)?.posters?.[0]?.file_path
        if (posterPath) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!posterMap[row.tierlistId]) posterMap[row.tierlistId] = []
          if (posterMap[row.tierlistId].length < 6) {
            posterMap[row.tierlistId].push(posterPath)
          }
        }
      }

      return userTierlists.map((tl) => ({
        id: tl.id,
        title: tl.title,
        genres: tl.genres,
        watchDateFrom: tl.watchDateFrom,
        watchDateTo: tl.watchDateTo,
        tierCount: tierCountMap.get(tl.id) ?? 0,
        movieCount: movieCountMap.get(tl.id) ?? 0,
        posterPaths: posterMap[tl.id] ?? [],
      }))
    } catch (error) {
      console.error('Error fetching user tierlists summary:', error)
      throw error
    }
  })

const THIRTY_MINUTES = 1000 * 60 * 30

export const tierlistQueries = {
  all: () =>
    queryOptions({
      queryKey: ['tierlists', 'all'],
      queryFn: getTierlists,
      staleTime: THIRTY_MINUTES,
    }),
  index: () =>
    queryOptions<Array<UserTierlistSummary>>({
      queryKey: ['tierlists', 'index'],
      queryFn: getTierlistIndex,
      staleTime: THIRTY_MINUTES,
    }),
  user: (userId: string) =>
    queryOptions<Array<TierlistWithDetails>>({
      queryKey: ['tierlists', 'user', userId],
      queryFn: () => getUserTierlists({ data: userId }),
      staleTime: THIRTY_MINUTES,
    }),
  single: (tierlistId: string) =>
    queryOptions<TierlistWithDetails | null>({
      queryKey: ['tierlists', 'single', tierlistId],
      queryFn: () => getSingleTierlist({ data: tierlistId }),
      staleTime: THIRTY_MINUTES,
    }),
  userSummary: (userId: string) =>
    queryOptions<Array<TierlistPreview>>({
      queryKey: ['tierlists', 'user', userId, 'summary'],
      queryFn: () => getUserTierlistsSummary({ data: userId }),
      staleTime: THIRTY_MINUTES,
    }),
}

export const useTierlistLiveQuery = (
  userId: string,
  tierlistId: string,
): TierlistWithTiers | null => {
  const { data: tierlists } = useSuspenseQuery(tierlistQueries.user(userId))
  const { data: allMovies } = useSuspenseQuery(movieQueries.allWatched())

  return useMemo(() => {
    if (tierlists.length === 0) return null

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

    const unrankedMovies = allMovies.filter((m) => {
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

export const useSingleTierlistLiveQuery = (
  tierlistId: string,
): TierlistWithTiers | null => {
  const { data: tierlistData } = useSuspenseQuery(
    tierlistQueries.single(tierlistId),
  )
  const { data: allMovies } = useSuspenseQuery(movieQueries.allWatched())

  return useMemo(() => {
    if (!tierlistData) return null

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

    const { watchDateFrom, watchDateTo, genres } = tierlistData

    const unrankedMovies = allMovies.filter((m) => {
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
  }, [tierlistData, allMovies])
}
