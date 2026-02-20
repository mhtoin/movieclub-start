import { db } from '@/db/db'
import { movie } from '@/db/schema/movies'
import { user } from '@/db/schema/users'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { and, count, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm'

export interface DashboardStats {
  totalWatchedMovies: number
  totalWatchedByCurrentUser: number
  totalWatchTime: number
  uniqueGenres: number
  averageRating: number
  userWatchTime: number
  userUniqueGenres: number
  userAverageRating: number
}

export interface GenreCount {
  genre: string
  count: number
}

export interface RatingBucket {
  range: string
  count: number
}

export interface PersonCount {
  name: string
  count: number
  profilePath: string | null
}

export interface DecadeBucket {
  decade: string
  count: number
}

export interface LanguageCount {
  language: string
  count: number
}

export interface MoviesByUser {
  userName: string
  userImage: string
  count: number
}

export interface DashboardInsights {
  genreDistribution: GenreCount[]
  ratingDistribution: RatingBucket[]
  topDirectors: PersonCount[]
  topCast: PersonCount[]
  decadeDistribution: DecadeBucket[]
  languageDistribution: LanguageCount[]
  moviesByUser: MoviesByUser[]
  highestRated: {
    title: string
    rating: number
    posterPath: string | null
    year: string
  }[]
  longestMovies: {
    title: string
    runtime: number
    posterPath: string | null
  }[]
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
      const [
        totalWatchedResult,
        userWatchedResult,
        watchTimeResult,
        genresResult,
        ratingResult,
        userWatchTimeResult,
        userGenresResult,
        userRatingResult,
      ] = await Promise.all([
        db
          .select({ count: count() })
          .from(movie)
          .where(isNotNull(movie.watchDate)),

        db
          .select({ count: count() })
          .from(movie)
          .where(
            and(isNotNull(movie.watchDate), eq(movie.userId, data.userId)),
          ),

        db
          .select({
            totalMinutes: sql<number>`COALESCE(SUM(${movie.runtime}), 0)`,
          })
          .from(movie)
          .where(and(isNotNull(movie.watchDate), isNotNull(movie.runtime))),

        db
          .select({ genres: movie.genres })
          .from(movie)
          .where(and(isNotNull(movie.watchDate), isNotNull(movie.genres))),

        db
          .select({
            avgRating: sql<number>`COALESCE(AVG(${movie.voteAverage}), 0)`,
          })
          .from(movie)
          .where(isNotNull(movie.watchDate)),

        db
          .select({
            totalMinutes: sql<number>`COALESCE(SUM(${movie.runtime}), 0)`,
          })
          .from(movie)
          .where(
            and(
              isNotNull(movie.watchDate),
              isNotNull(movie.runtime),
              eq(movie.userId, data.userId),
            ),
          ),

        db
          .select({ genres: movie.genres })
          .from(movie)
          .where(
            and(
              isNotNull(movie.watchDate),
              isNotNull(movie.genres),
              eq(movie.userId, data.userId),
            ),
          ),

        db
          .select({
            avgRating: sql<number>`COALESCE(AVG(${movie.voteAverage}), 0)`,
          })
          .from(movie)
          .where(
            and(isNotNull(movie.watchDate), eq(movie.userId, data.userId)),
          ),
      ])

      const totalWatched = totalWatchedResult[0]?.count ?? 0
      const userWatched = userWatchedResult[0]?.count ?? 0
      const totalWatchTime = Math.round(watchTimeResult[0]?.totalMinutes ?? 0)
      const allGenres = new Set<string>()
      genresResult.forEach((row) => {
        if (row.genres) row.genres.forEach((genre) => allGenres.add(genre))
      })
      const averageRating = Number((ratingResult[0]?.avgRating ?? 0).toFixed(1))
      const userWatchTime = Math.round(
        userWatchTimeResult[0]?.totalMinutes ?? 0,
      )
      const userGenres = new Set<string>()
      userGenresResult.forEach((row) => {
        if (row.genres) row.genres.forEach((genre) => userGenres.add(genre))
      })
      const userAverageRating = Number(
        (userRatingResult[0]?.avgRating ?? 0).toFixed(1),
      )

      return {
        totalWatchedMovies: totalWatched,
        totalWatchedByCurrentUser: userWatched,
        totalWatchTime,
        uniqueGenres: allGenres.size,
        averageRating,
        userWatchTime,
        userUniqueGenres: userGenres.size,
        userAverageRating,
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalWatchedMovies: 0,
        totalWatchedByCurrentUser: 0,
        totalWatchTime: 0,
        uniqueGenres: 0,
        averageRating: 0,
        userWatchTime: 0,
        userUniqueGenres: 0,
        userAverageRating: 0,
      }
    }
  })

export const getDashboardInsights = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId?: string }) => data)
  .handler(async ({ data }): Promise<DashboardInsights> => {
    try {
      const whereConditions = data.userId
        ? and(isNotNull(movie.watchDate), eq(movie.userId, data.userId))
        : isNotNull(movie.watchDate)

      const watchedMovies = await db
        .select({
          id: movie.id,
          genres: movie.genres,
          voteAverage: movie.voteAverage,
          releaseDate: movie.releaseDate,
          cast: movie.cast,
          crew: movie.crew,
          originalLanguage: movie.originalLanguage,
          title: movie.title,
          runtime: movie.runtime,
          userId: movie.userId,
        })
        .from(movie)
        .where(whereConditions)

      // Genre distribution
      const genreMap = new Map<string, number>()
      watchedMovies.forEach((m) => {
        m.genres?.forEach((g) => {
          genreMap.set(g, (genreMap.get(g) || 0) + 1)
        })
      })
      const genreDistribution = Array.from(genreMap.entries())
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)

      // Rating distribution (individual ratings 0-10)
      const ratingMap = new Map<string, number>()
      watchedMovies.forEach((m) => {
        const rating = Math.round(m.voteAverage).toString()
        ratingMap.set(rating, (ratingMap.get(rating) || 0) + 1)
      })
      // Ensure all ratings 0-10 are present even if count is 0
      const ratingDistribution = Array.from({ length: 11 }, (_, i) => ({
        range: i.toString(),
        count: ratingMap.get(i.toString()) || 0,
      }))

      // Top directors (from crew JSON)
      const directorMap = new Map<
        string,
        { count: number; profilePath: string | null }
      >()
      watchedMovies.forEach((m) => {
        if (Array.isArray(m.crew)) {
          m.crew
            .filter((c: any) => c.job === 'Director')
            .forEach((d: any) => {
              const existing = directorMap.get(d.name)
              directorMap.set(d.name, {
                count: (existing?.count || 0) + 1,
                profilePath: d.profile_path || existing?.profilePath || null,
              })
            })
        }
      })
      const topDirectors = Array.from(directorMap.entries())
        .map(([name, { count, profilePath }]) => ({ name, count, profilePath }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Top cast (from cast JSON)
      const castMap = new Map<
        string,
        { count: number; profilePath: string | null }
      >()
      watchedMovies.forEach((m) => {
        if (Array.isArray(m.cast)) {
          m.cast.slice(0, 5).forEach((c: any) => {
            const existing = castMap.get(c.name)
            castMap.set(c.name, {
              count: (existing?.count || 0) + 1,
              profilePath: c.profile_path || existing?.profilePath || null,
            })
          })
        }
      })
      const topCast = Array.from(castMap.entries())
        .map(([name, { count, profilePath }]) => ({ name, count, profilePath }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Decade distribution
      const decadeMap = new Map<string, number>()
      watchedMovies.forEach((m) => {
        if (m.releaseDate) {
          const year = parseInt(m.releaseDate.substring(0, 4))
          if (!isNaN(year)) {
            const decade = `${Math.floor(year / 10) * 10}s`
            decadeMap.set(decade, (decadeMap.get(decade) || 0) + 1)
          }
        }
      })
      const decadeDistribution = Array.from(decadeMap.entries())
        .map(([decade, count]) => ({ decade, count }))
        .sort((a, b) => a.decade.localeCompare(b.decade))

      // Language distribution
      const langMap = new Map<string, number>()
      watchedMovies.forEach((m) => {
        if (m.originalLanguage) {
          const lang = m.originalLanguage.toUpperCase()
          langMap.set(lang, (langMap.get(lang) || 0) + 1)
        }
      })
      const languageDistribution = Array.from(langMap.entries())
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Movies by user
      const userIds = [
        ...new Set(watchedMovies.map((m) => m.userId).filter(Boolean)),
      ] as string[]
      const users =
        userIds.length > 0
          ? await db
              .select({ id: user.id, name: user.name, image: user.image })
              .from(user)
              .where(sql`${user.id} IN ${userIds}`)
          : []
      const userMap = new Map(users.map((u) => [u.id, u]))
      const userCountMap = new Map<string, number>()
      watchedMovies.forEach((m) => {
        if (m.userId) {
          userCountMap.set(m.userId, (userCountMap.get(m.userId) || 0) + 1)
        }
      })
      const moviesByUser = Array.from(userCountMap.entries())
        .map(([id, count]) => {
          const u = userMap.get(id)
          return {
            userName: u?.name || 'Unknown',
            userImage: u?.image || '',
            count,
          }
        })
        .sort((a, b) => b.count - a.count)

      // Highest rated movies
      const topRatedIds = [...watchedMovies]
        .sort((a, b) => b.voteAverage - a.voteAverage)
        .slice(0, 5)
        .map((m) => m.id)

      // Longest movies
      const longestIds = [...watchedMovies]
        .filter((m) => m.runtime && m.runtime > 0)
        .sort((a, b) => (b.runtime || 0) - (a.runtime || 0))
        .slice(0, 5)
        .map((m) => m.id)
      const posterIds = [...new Set([...topRatedIds, ...longestIds])]
      const posterRows =
        posterIds.length > 0
          ? await db
              .select({ id: movie.id, images: movie.images })
              .from(movie)
              .where(inArray(movie.id, posterIds))
          : []
      const posterMap = new Map(
        posterRows.map((r) => [
          r.id,
          (r.images as any)?.posters?.[0]?.file_path || null,
        ]),
      )

      const highestRated = topRatedIds.map((id) => {
        const m = watchedMovies.find((w) => w.id === id)!
        return {
          title: m.title,
          rating: m.voteAverage,
          posterPath: posterMap.get(id) || null,
          year: m.releaseDate?.substring(0, 4) || '',
        }
      })

      // Longest movies
      const longestMovies = longestIds.map((id) => {
        const m = watchedMovies.find((w) => w.id === id)!
        return {
          title: m.title,
          runtime: m.runtime || 0,
          posterPath: posterMap.get(id) || null,
        }
      })

      return {
        genreDistribution,
        ratingDistribution,
        topDirectors,
        topCast,
        decadeDistribution,
        languageDistribution,
        moviesByUser,
        highestRated,
        longestMovies,
      }
    } catch (error) {
      console.error('Error fetching dashboard insights:', error)
      return {
        genreDistribution: [],
        ratingDistribution: [],
        topDirectors: [],
        topCast: [],
        decadeDistribution: [],
        languageDistribution: [],
        moviesByUser: [],
        highestRated: [],
        longestMovies: [],
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
  insights: (userId?: string) =>
    queryOptions({
      queryKey: [...dashboardQueries.all(), 'insights', userId ?? 'all'],
      queryFn: () => getDashboardInsights({ data: { userId } }),
    }),
  nextMovie: () =>
    queryOptions({
      queryKey: [...dashboardQueries.all(), 'nextMovie'],
      queryFn: getNextMovieToWatch,
    }),
}
