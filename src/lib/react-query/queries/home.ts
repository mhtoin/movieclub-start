import { db } from '@/db/db'
import { tierlist } from '@/db/schema'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

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
}

interface TMDBResponse {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

/**
 * Fetch trending movies from TMDB filtered by specific watch providers
 * Providers: 8 (Netflix), 323 (Viaplay), 463 (HBO Max), 496 (Mubi)
 */
export const getTrendingMovies = createServerFn({ method: 'GET' }).handler(
  async (): Promise<TMDBMovie[]> => {
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
  },
)

/**
 * Get movie recommendations based on user's highly ranked tierlist movies
 */
export const getRecommendations = createServerFn({ method: 'GET' })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }): Promise<TMDBMovie[]> => {
    if (!TMDB_CONFIG.API_KEY || !userId) {
      return []
    }

    try {
      // Get user's tierlists
      const userTierlists = await db.query.tierlist.findMany({
        where: eq(tierlist.userId, userId),
        with: {
          tiers: {
            with: {
              moviesOnTiers: {
                with: {
                  movie: true,
                },
              },
            },
            orderBy: (tiers, { asc }) => [asc(tiers.value)],
          },
        },
      })

      if (userTierlists.length === 0) {
        return []
      }

      // Get movies from top tiers (value <= 2, which are typically S, A tiers)
      const highlyRatedMovies: Array<{
        tmdbId: number
        genres: string[] | null
      }> = []

      for (const tl of userTierlists) {
        for (const t of tl.tiers) {
          // Lower value = higher tier (S=0, A=1, B=2, etc.)
          if (t.value <= 2) {
            for (const mot of t.moviesOnTiers) {
              if (mot.movie) {
                highlyRatedMovies.push({
                  tmdbId: mot.movie.tmdbId,
                  genres: mot.movie.genres,
                })
              }
            }
          }
        }
      }

      if (highlyRatedMovies.length === 0) {
        return []
      }

      // Pick up to 3 random highly rated movies to get recommendations from
      const shuffled = highlyRatedMovies.sort(() => Math.random() - 0.5)
      const seedMovies = shuffled.slice(0, 3)

      // Fetch recommendations from TMDB for each seed movie
      const recommendationPromises = seedMovies.map(async (seedMovie) => {
        const url = `${TMDB_CONFIG.BASE_URL}/movie/${seedMovie.tmdbId}/recommendations?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&page=1`

        try {
          const response = await fetch(url)
          if (!response.ok) return []

          const data: TMDBResponse = await response.json()
          return data.results.slice(0, 10)
        } catch {
          return []
        }
      })

      const allRecommendations = await Promise.all(recommendationPromises)
      const flatRecommendations = allRecommendations.flat()

      // Remove duplicates and movies already in user's tierlists
      const userMovieTmdbIds = new Set(highlyRatedMovies.map((m) => m.tmdbId))
      const seenIds = new Set<number>()
      const uniqueRecommendations: TMDBMovie[] = []

      for (const rec of flatRecommendations) {
        if (!seenIds.has(rec.id) && !userMovieTmdbIds.has(rec.id)) {
          seenIds.add(rec.id)
          uniqueRecommendations.push(rec)
        }
      }

      // Sort by popularity and return top 20
      return uniqueRecommendations
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      return []
    }
  })

export const homeQueries = {
  trending: () =>
    queryOptions({
      queryKey: ['home', 'trending'],
      queryFn: getTrendingMovies,
      staleTime: 1000 * 60 * 30, // 30 minutes
    }),
  recommendations: (userId: string) =>
    queryOptions({
      queryKey: ['home', 'recommendations', userId],
      queryFn: () => getRecommendations({ data: userId }),
      staleTime: 1000 * 60 * 30, // 30 minutes
      enabled: !!userId,
    }),
}
