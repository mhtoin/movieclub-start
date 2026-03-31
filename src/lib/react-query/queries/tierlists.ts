import { db } from '@/db/db'
import { movie, moviesOnTiers, tier, tierlist, user } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import {
  and,
  count,
  countDistinct,
  desc,
  eq as dbEq,
  inArray,
  InferSelectModel,
  sql,
} from 'drizzle-orm'
import { useMemo } from 'react'
import { z } from 'zod'
import { movieQueries } from './movies'

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
  movies: (Movie & { position: number; movieOnTierId: string })[]
}

interface TierlistWithTiers extends Tierlist {
  tiers: TierWithMovies[]
}

export interface TierlistPreview {
  id: string
  title: string | null
  genres: string[] | null
  watchDateFrom: string | null
  watchDateTo: string | null
  tierCount: number
  movieCount: number
  posterPaths: string[]
}

export interface UserTierlistSummary {
  id: string
  name: string | null
  image: string | null
  tierlists: TierlistPreview[]
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

async function assertOwnedTierIds(userId: string, tierIds: string[]) {
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
  movieOnTierIds: string[],
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
    const id = movieOnTierId as (typeof moviesOnTiers.$inferSelect)['id']

    await assertOwnedMovieOnTierIds(currentUser.userId, [movieOnTierId])
    await assertOwnedTierIds(currentUser.userId, tierId ? [tierId] : [])

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
  .middleware([authMiddleware])
  .inputValidator(batchUpdateTierMoviePositionsSchema)
  .handler(async ({ context, data }) => {
    if (data.length === 0) return { txid: 0 }

    if (!context.user) throw new Error('Unauthorized')
    const currentUser = context.user

    await assertOwnedMovieOnTierIds(
      currentUser.userId,
      data.map((update) => update.movieOnTierId),
    )
    await assertOwnedTierIds(
      currentUser.userId,
      data.map((update) => update.tierId),
    )

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
            orderBy: (tiers: any, { asc }: any) => [asc(tiers.value)],
          },
        },
      })
      return (result as TierlistWithDetails) ?? null
    } catch (error) {
      console.error('Error fetching single tierlist:', error)
      throw error
    }
  })

export const getTierlists = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.user) throw new Error('Unauthorized')

    try {
      const users = await (db as any).query.user.findMany({
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

export const getTierlistIndex = createServerFn({ method: 'GET' })
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
    const posterMap: Record<string, string[]> = {}

    if (tierlistIds.length > 0) {
      const posterRows = await db
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

      for (const row of posterRows) {
        const posterPath = (row.images as any)?.posters?.[0]?.file_path
        if (posterPath) {
          if (!posterMap[row.tierlistId]) posterMap[row.tierlistId] = []
          if (posterMap[row.tierlistId].length < 4) {
            posterMap[row.tierlistId].push(posterPath)
          }
        }
      }
    }

    const userMap = new Map<string, UserTierlistSummary>()

    for (const row of users) {
      if (!userMap.has(row.id)) {
        userMap.set(row.id, {
          id: row.id,
          name: row.name,
          image: row.image,
          tierlists: [],
        })
      }

      const existing = userMap.get(row.id)!
      const existingTierlist = existing.tierlists.find(
        (t) => t.id === row.tierlistId,
      )

      if (!existingTierlist) {
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
  index: () =>
    queryOptions<UserTierlistSummary[]>({
      queryKey: ['tierlists', 'index'],
      queryFn: getTierlistIndex,
    }),
  user: (userId: string) =>
    queryOptions<TierlistWithDetails[]>({
      queryKey: ['tierlists', 'user', userId],
      queryFn: () => getUserTierlists({ data: userId }),
    }),
  single: (tierlistId: string) =>
    queryOptions<TierlistWithDetails | null>({
      queryKey: ['tierlists', 'single', tierlistId],
      queryFn: () => getSingleTierlist({ data: tierlistId }),
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
  }, [tierlistData, allMovies])
}
