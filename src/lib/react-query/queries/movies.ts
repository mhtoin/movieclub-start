import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { format } from 'date-fns'
import {
  and,
  arrayContains,
  desc,
  eq,
  getTableColumns,
  isNotNull,
  like,
  sql,
} from 'drizzle-orm'
import { z } from 'zod'
import type { SQL } from 'drizzle-orm'
import { db } from '@/db/db'
import { movie } from '@/db/schema/movies'
import { compactMovieImages, firstMoviePosterPath } from '@/db/sql/movie-images'
import { user } from '@/db/schema/users'
import { groupBy } from '@/lib/utils'
import { authMiddleware } from '@/middleware/auth'

export const getLatestMovies = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.user) throw new Error('Unauthorized')

    try {
      const rows = await db
        .select({
          movie: {
            ...getTableColumns(movie),
            images: compactMovieImages(movie.images),
          },
          user: { name: user.name },
        })
        .from(movie)
        .innerJoin(user, eq(user.id, movie.userId))
        .where(isNotNull(movie.watchDate))
        .orderBy(desc(movie.watchDate))
        .limit(1)

      if (rows.length === 0) return null

      return {
        movie: rows[0].movie,
        user: rows[0].user,
      }
    } catch (error) {
      console.error('Error fetching latest movie:', error)
      return null
    }
  })

export const getDistinctWatchedMonths = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.user) throw new Error('Unauthorized')

    const rows = await db
      .selectDistinct({
        month: sql<string>`to_char(${movie.watchDate}, 'YYYY-MM')`,
      })
      .from(movie)
      .where(isNotNull(movie.watchDate))
      .orderBy(sql`to_char(${movie.watchDate}, 'YYYY-MM') desc`)

    return rows.reduce<Array<{ value: string; label: string }>>((acc, row) => {
      if (row.month) {
        acc.push({
          value: row.month,
          label: new Date(row.month + '-01').toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          }),
        })
      }
      return acc
    }, [])
  })

const watchedByMonthSchema = z.object({
  search: z.string().optional(),
  username: z.string().optional(),
  genre: z.string().optional(),
  // 'YYYY-MM' string — when provided, only movies from that month are fetched
  month: z.string().optional(),
})

export const getWatchedMoviesByMonth = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator((data: z.infer<typeof watchedByMonthSchema>) => data)
  .handler(async ({ context, data }) => {
    if (!context.user) throw new Error('Unauthorized')

    const { search, username } = data

    // Conditionally construct filter conditions
    const conditions: Array<SQL> = [isNotNull(movie.watchDate)]

    if (search && search.trim() !== '') {
      conditions.push(like(movie.title, `%${search.trim()}%`))
    }

    if (username && username.trim() !== '') {
      conditions.push(eq(user.name, username.trim()))
    }

    if (data.genre && data.genre.trim() !== '') {
      conditions.push(arrayContains(movie.genres, [data.genre]))
    }

    // Filter to a single month server-side, avoiding a full-table fetch
    if (data.month && data.month.trim() !== '') {
      conditions.push(
        sql`to_char(${movie.watchDate}, 'YYYY-MM') = ${data.month.trim()}`,
      )
    }

    // Fetch movies with combined filters
    const movies = await db
      .select({
        movie: {
          id: movie.id,
          title: movie.title,
          releaseDate: movie.releaseDate,
          overview: movie.overview,
          runtime: movie.runtime,
          watchDate: movie.watchDate,
          images: compactMovieImages(movie.images),
        },
        user: { id: user.id, name: user.name, image: user.image },
      })
      .from(movie)
      .innerJoin(user, eq(user.id, movie.userId))
      .where(and(...conditions))
      .orderBy(desc(movie.watchDate))

    return groupBy(
      movies.map((row) => ({
        movie: row.movie,
        user: row.user,
      })),
      (item) => {
        const watchDate = item.movie.watchDate
        if (!watchDate) return 'Unknown'
        const date = new Date(watchDate)
        return format(date, 'yyyy-MM')
      },
    )
  })

const WATCHED_MOVIES_CAP = 200

export const getAllWatchedMovies = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.user) throw new Error('Unauthorized')

    return db
      .select({
        ...getTableColumns(movie),
        images: compactMovieImages(movie.images),
      })
      .from(movie)
      .where(isNotNull(movie.watchDate))
      .orderBy(desc(movie.watchDate))
      .limit(WATCHED_MOVIES_CAP)
  })

const RECENT_WATCHED_LIMIT = 6

export type RecentWatchedMovie = {
  id: string
  title: string
  watchDate: Date | null
  releaseDate: string | null
  posterPath: string | null
}

export const getRecentWatchedMovies = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Array<RecentWatchedMovie>> => {
    if (!context.user) throw new Error('Unauthorized')

    return db
      .select({
        id: movie.id,
        title: movie.title,
        watchDate: movie.watchDate,
        releaseDate: movie.releaseDate,
        posterPath: firstMoviePosterPath(movie.images),
      })
      .from(movie)
      .where(isNotNull(movie.watchDate))
      .orderBy(desc(movie.watchDate))
      .limit(RECENT_WATCHED_LIMIT)
  })

const THIRTY_MINUTES = 1000 * 60 * 30

export const movieQueries = {
  all: () => ['movies'],
  latest: () =>
    queryOptions({
      queryKey: [...movieQueries.all(), 'latest'],
      queryFn: getLatestMovies,
      staleTime: THIRTY_MINUTES,
    }),
  watched: (
    search?: string,
    username?: string,
    genre?: string,
    month?: string,
  ) =>
    queryOptions({
      queryKey: [
        ...movieQueries.all(),
        'watched',
        search,
        username,
        genre,
        month,
      ],
      queryFn: async () => {
        const result = await getWatchedMoviesByMonth({
          data: { search, username, genre, month },
        })
        return result
      },
      staleTime: THIRTY_MINUTES,
    }),
  months: () =>
    queryOptions({
      queryKey: [...movieQueries.all(), 'months'],
      queryFn: getDistinctWatchedMonths,
      staleTime: THIRTY_MINUTES,
    }),
  allWatched: () =>
    queryOptions({
      queryKey: [...movieQueries.all(), 'allWatched'],
      queryFn: getAllWatchedMovies,
      staleTime: THIRTY_MINUTES,
    }),
  // Keep this under the allWatched prefix so existing movie invalidations
  // (SSE + mutations) also refresh the history strip.
  recentWatched: () =>
    queryOptions({
      queryKey: [...movieQueries.all(), 'allWatched', 'recent'],
      queryFn: getRecentWatchedMovies,
      staleTime: THIRTY_MINUTES,
    }),

  /* For now, we use simple query instead of infinite query
    watched: (search?: string) => infiniteQueryOptions({
        queryKey: [...movieQueries.all(), 'watched', search],
        queryFn: async ({ pageParam }) => {
            const result = await getWatchedMoviesByMonth({ data: { month: pageParam, search } });
            return result;
        },
        initialPageParam: new Date().toISOString().slice(0,7),
        getNextPageParam: (lastPage) => {
            return lastPage.nextMonth ?? undefined;
        },
    }),*/
}
