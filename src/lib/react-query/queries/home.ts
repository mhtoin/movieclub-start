import { db } from '@/db/db'
import { movie, moviesOnTiers, tier, tierlist } from '@/db/schema'
import { getCached, setCache } from '@/lib/tmdb-cache'
import { authMiddleware } from '@/middleware/auth'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { InferSelectModel } from 'drizzle-orm'

type Movie = InferSelectModel<typeof movie>
type MovieOnTier = InferSelectModel<typeof moviesOnTiers>
type Tier = InferSelectModel<typeof tier>
type Tierlist = InferSelectModel<typeof tierlist>

type TierlistWithDetails = Tierlist & {
  tiers: Array<Tier & { moviesOnTiers: Array<MovieOnTier & { movie: Movie }> }>
}

const TMDB_CONFIG = {
  API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  BASE_URL:
    import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
}

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  becauseYouLiked?: {
    title: string
    posterPath: string | null
  }
}

interface TMDBResponse {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

/**
 * Fetch trending movies from TMDB filtered by specific watch providers
 */
export const getTrendingMovies = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<TMDBMovie[]> => {
    if (!context.user) throw new Error('Unauthorized')

    if (!TMDB_CONFIG.API_KEY) {
      console.error('TMDB API key is not configured')
      return []
    }

    const providers = '8|323|463|496'

    const queryParams = new URLSearchParams({
      api_key: TMDB_CONFIG.API_KEY,
      include_adult: 'false',
      include_video: 'false',
      language: 'en-US',
      page: '1',
      sort_by: 'popularity.desc',
      watch_region: 'FI',
      with_watch_providers: providers,
    })

    const url = `${TMDB_CONFIG.BASE_URL}/discover/movie?${queryParams.toString()}`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `TMDB API error: ${response.status} ${response.statusText}`,
        )
      }

      const data: TMDBResponse = await response.json()
      // Return first 20 movies
      return data.results.slice(0, 20)
    } catch (error) {
      console.error('Error fetching trending movies:', error)
      return []
    }
  })

export interface RecommendationSeed {
  tmdbId: number
  title: string
  posterPath: string | null
}

/**
 * Pick up to 3 random seed movies from the user's top tiers
 */
export const getRecommendationSeeds = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((userId: string) => userId)
  .handler(async ({ context, data: userId }): Promise<RecommendationSeed[]> => {
    if (!context.user || context.user.userId !== userId)
      throw new Error('Forbidden')

    if (!TMDB_CONFIG.API_KEY || !userId) return []

    try {
      const userTierlists = (await (db as any).query.tierlist.findMany({
        where: (tierlist: any, { eq }: any) => eq(tierlist.userId, userId),
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
      })) as TierlistWithDetails[]

      const topMovies: Array<{ tmdbId: number; title: string }> = []
      for (const tl of userTierlists) {
        for (const t of tl.tiers) {
          if (t.value <= 2) {
            for (const mot of t.moviesOnTiers) {
              if (mot.movie) {
                topMovies.push({
                  tmdbId: mot.movie.tmdbId,
                  title: mot.movie.title,
                })
              }
            }
          }
        }
      }

      if (topMovies.length === 0) return []

      const shuffled = topMovies.sort(() => Math.random() - 0.5)
      const picks = shuffled.slice(0, 3)

      // Fetch poster paths from TMDB in parallel
      const seeds = await Promise.all(
        picks.map(async (pick) => {
          const url = `${TMDB_CONFIG.BASE_URL}/movie/${pick.tmdbId}?api_key=${TMDB_CONFIG.API_KEY}&language=en-US`
          try {
            const res = await fetch(url)
            if (!res.ok) return { ...pick, posterPath: null as string | null }
            const data = await res.json()
            return {
              ...pick,
              posterPath: data.poster_path as string | null,
            }
          } catch {
            return { ...pick, posterPath: null as string | null }
          }
        }),
      )

      return seeds
    } catch (error) {
      console.error('Error fetching recommendation seeds:', error)
      return []
    }
  })

const TARGET_PROVIDERS = '8|323|463|496'
const WATCH_REGION = 'FI'
const PROVIDER_CHECK_TTL = 1000 * 60 * 60 * 24 // 24 hours

async function isAvailableInTargetProviders(movieId: number): Promise<boolean> {
  const cacheKey = `provider:${movieId}`
  const cached = getCached<boolean>(cacheKey)
  if (cached !== undefined) return cached

  const url = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_CONFIG.API_KEY}`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      setCache(cacheKey, false, PROVIDER_CHECK_TTL)
      return false
    }
    const data = await response.json()
    const regionData = data.results?.[WATCH_REGION]
    if (!regionData) {
      setCache(cacheKey, false, PROVIDER_CHECK_TTL)
      return false
    }
    const providerIds = new Set<number>()
    for (const provider of regionData.flatrate ?? [])
      providerIds.add(provider.provider_id)
    for (const provider of regionData.ads ?? [])
      providerIds.add(provider.provider_id)
    for (const provider of regionData.free ?? [])
      providerIds.add(provider.provider_id)
    const targetIds = TARGET_PROVIDERS.split('|').map(Number)
    const result = targetIds.some((id) => providerIds.has(id))
    setCache(cacheKey, result, PROVIDER_CHECK_TTL)
    return result
  } catch {
    return false
  }
}

/**
 * Fetch provider-filtered TMDB recommendations for a single seed movie.
 * Paginates until it finds enough movies available on target providers.
 * Provider availability checks are cached for 24 hours.
 */
export const getRecommendationsForSeed = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(
    (input: {
      seedTmdbId: number
      seedTitle: string
      seedPosterPath: string | null
      excludeTmdbIds: number[]
    }) => input,
  )
  .handler(async ({ context, data }): Promise<TMDBMovie[]> => {
    if (!context.user) throw new Error('Unauthorized')
    if (!TMDB_CONFIG.API_KEY) return []

    const { seedTmdbId, seedTitle, seedPosterPath, excludeTmdbIds } = data
    const excludeSet = new Set(excludeTmdbIds)
    const results: TMDBMovie[] = []
    const perSeedTarget = 10
    let page = 1
    const maxPages = 2

    while (results.length < perSeedTarget && page <= maxPages) {
      const recsCacheKey = `recs:${seedTmdbId}:${page}`
      let recData = getCached<TMDBResponse>(recsCacheKey)

      if (!recData) {
        const url = `${TMDB_CONFIG.BASE_URL}/movie/${seedTmdbId}/recommendations?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&page=${page}`
        try {
          const response = await fetch(url)
          if (!response.ok) break
          const json = (await response.json()) as TMDBResponse
          setCache(recsCacheKey, json, 1000 * 60 * 60 * 6)
          recData = json
        } catch {
          break
        }
      }

      if (recData.results.length === 0) break

      const providerChecks = await Promise.all(
        recData.results.map(async (movie) => {
          if (excludeSet.has(movie.id)) return null
          excludeSet.add(movie.id)
          const ok = await isAvailableInTargetProviders(movie.id)
          if (!ok) return null
          return {
            ...movie,
            becauseYouLiked: {
              title: seedTitle,
              posterPath: seedPosterPath,
            },
          }
        }),
      )

      for (const rec of providerChecks) {
        if (rec) {
          results.push(rec)
          if (results.length >= perSeedTarget) break
        }
      }
      page++
    }

    return results
  })

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7

export const homeQueries = {
  trending: () =>
    queryOptions({
      queryKey: ['home', 'trending'],
      queryFn: getTrendingMovies,
      staleTime: ONE_WEEK,
    }),
  seeds: (userId: string) =>
    queryOptions({
      queryKey: ['home', 'recommendation-seeds', userId],
      queryFn: () => getRecommendationSeeds({ data: userId }),
      staleTime: ONE_WEEK,
      enabled: !!userId,
    }),
  forSeed: (seed: RecommendationSeed, excludeTmdbIds: number[]) =>
    queryOptions({
      queryKey: [
        'home',
        'recommendations-for-seed',
        seed.tmdbId,
        excludeTmdbIds,
      ],
      queryFn: () =>
        getRecommendationsForSeed({
          data: {
            seedTmdbId: seed.tmdbId,
            seedTitle: seed.title,
            seedPosterPath: seed.posterPath,
            excludeTmdbIds,
          },
        }),
      staleTime: ONE_WEEK,
      enabled: seed.tmdbId > 0,
    }),
}
