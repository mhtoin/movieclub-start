import { db } from '@/db/db'
import { movie } from '@/db/schema/movies'
import { user } from '@/db/schema/users'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { and, count, desc, eq, isNotNull, sql } from 'drizzle-orm'

export interface DashboardStats {
  totalWatchedMovies: number
  totalWatchedByCurrentUser: number
  totalWatchTime: number
  uniqueGenres: number
  averageRating: number
}

export interface NextMovieToWatch {
  movie: {
    id: string
    title: string
    originalTitle: string
    overview: string
    releaseDate: string
    runtime: number | null
    voteAverage: number
    genres: string[] | null
    tagline: string | null
    tmdbId: number
    imdbId: string | null
    images: {
      backdrops?: Array<{ file_path: string; [key: string]: any }>
      posters?: Array<{ file_path: string; [key: string]: any }>
    } | null
    watchProviders: Record<string, any> | null
  }
  user: {
    id: string
    name: string
    email: string
    image: string
  }
}

export const getDashboardStats = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<DashboardStats> => {
    try {
      const totalWatchedResult = await db
        .select({ count: count() })
        .from(movie)
        .where(isNotNull(movie.watchDate))

      const totalWatched = totalWatchedResult[0]?.count ?? 0

      const userWatchedResult = await db
        .select({ count: count() })
        .from(movie)
        .where(and(isNotNull(movie.watchDate), eq(movie.userId, data.userId)))

      const userWatched = userWatchedResult[0]?.count ?? 0

      const watchTimeResult = await db
        .select({
          totalMinutes: sql<number>`COALESCE(SUM(${movie.runtime}), 0)`,
        })
        .from(movie)
        .where(and(isNotNull(movie.watchDate), isNotNull(movie.runtime)))

      const totalWatchTime = Math.round(watchTimeResult[0]?.totalMinutes ?? 0)

      const genresResult = await db
        .select({ genres: movie.genres })
        .from(movie)
        .where(and(isNotNull(movie.watchDate), isNotNull(movie.genres)))

      const allGenres = new Set<string>()
      genresResult.forEach((row) => {
        if (row.genres) {
          row.genres.forEach((genre) => allGenres.add(genre))
        }
      })

      const ratingResult = await db
        .select({
          avgRating: sql<number>`COALESCE(AVG(${movie.voteAverage}), 0)`,
        })
        .from(movie)
        .where(isNotNull(movie.watchDate))

      const averageRating = Number((ratingResult[0]?.avgRating ?? 0).toFixed(1))

      return {
        totalWatchedMovies: totalWatched,
        totalWatchedByCurrentUser: userWatched,
        totalWatchTime,
        uniqueGenres: allGenres.size,
        averageRating,
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalWatchedMovies: 0,
        totalWatchedByCurrentUser: 0,
        totalWatchTime: 0,
        uniqueGenres: 0,
        averageRating: 0,
      }
    }
  })

export const getNextMovieToWatch = createServerFn({ method: 'GET' }).handler(
  async (): Promise<NextMovieToWatch | null> => {
    try {
      const rows = await db
        .select()
        .from(movie)
        .innerJoin(user, eq(user.id, movie.userId))
        .where(isNotNull(movie.watchDate))
        .orderBy(desc(movie.watchDate))
        .limit(1)

      if (rows.length === 0) return null

      const movieData = rows[0].movie
      const userData = rows[0].user

      if (!movieData || !userData) return null

      return {
        movie: movieData,
        user: userData,
      }
    } catch (error) {
      console.error('Error fetching next movie to watch:', error)
      return null
    }
  },
)

export const dashboardQueries = {
  all: () => ['dashboard'],
  stats: (userId: string) =>
    queryOptions({
      queryKey: [...dashboardQueries.all(), 'stats', userId],
      queryFn: async () => {
        const result = await getDashboardStats({ data: { userId } })
        return result
      },
    }),
  nextMovie: () =>
    queryOptions({
      queryKey: [...dashboardQueries.all(), 'nextMovie'],
      queryFn: getNextMovieToWatch,
    }),
}
