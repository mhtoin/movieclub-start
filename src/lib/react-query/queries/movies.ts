import { db } from '@/db/db'
import { movie, type MovieWithUser } from '@/db/schema/movies'
import { user } from '@/db/schema/users'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import { createCollection } from '@tanstack/react-db'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { format } from 'date-fns'
import { and, arrayContains, desc, eq, isNotNull, like, SQL } from 'drizzle-orm'
import { z } from 'zod'

export const getLatestMovies = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MovieWithUser | null> => {
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

      if (!movieData) return null

      return {
        movie: movieData,
        user: rows[0].user,
      }
    } catch (error) {
      console.error('Error fetching latest movie:', error)
      return null
    }
  },
)

export const getDistinctWatchedMonths = createServerFn({
  method: 'GET',
}).handler(async () => {
  const rows = await db
    .select({
      month: movie.watchDate,
    })
    .from(movie)

  if (!rows) return null

  const uniqueMonths = new Set<string>()
  rows.forEach((row) => {
    if (row.month) {
      const date = new Date(row.month)
      const monthString = format(date, 'yyyy-MM')
      uniqueMonths.add(monthString)
    }
  })

  const sortedMonths = Array.from(uniqueMonths).sort((a, b) =>
    b.localeCompare(a),
  )

  const mappedRows = sortedMonths.map((month) => ({
    value: month,
    label: new Date(month + '-01').toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    }),
  }))

  return mappedRows
})

const watchedByMonthSchema = z.object({
  search: z.string().optional(),
  username: z.string().optional(),
  genre: z.string().optional(),
})

export const getWatchedMoviesByMonth = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof watchedByMonthSchema>) => data)
  .handler(async ({ data }) => {
    const { search, username } = data

    // Conditionally construct filter conditions
    const conditions: SQL[] = [isNotNull(movie.watchDate)]

    if (search && search.trim() !== '') {
      conditions.push(like(movie.title, `%${search.trim()}%`))
    }

    if (username && username.trim() !== '') {
      conditions.push(eq(user.name, username.trim()))
    }

    if (data.genre && data.genre.trim() !== '') {
      conditions.push(arrayContains(movie.genres, [data.genre]))
    }

    // Fetch movies with combined filters
    const movies = await db
      .select()
      .from(movie)
      .innerJoin(user, eq(user.id, movie.userId))
      .where(and(...conditions))
      .orderBy(desc(movie.watchDate))

    return Object.groupBy(movies, (item) => {
      const watchDate = item.movie.watchDate
      if (!watchDate) return 'Unknown'
      const date = new Date(watchDate)
      return format(date, 'yyyy-MM')
    })
  })

export const movieQueries = {
  all: () => ['movies'],
  latest: () =>
    queryOptions({
      queryKey: [...movieQueries.all(), 'latest'],
      queryFn: getLatestMovies,
    }),
  watched: (search?: string, username?: string, genre?: string) =>
    queryOptions({
      queryKey: [...movieQueries.all(), 'watched', search, username, genre],
      queryFn: async () => {
        const result = await getWatchedMoviesByMonth({
          data: { search, username, genre },
        })
        return result
      },
    }),
  months: () =>
    queryOptions({
      queryKey: [...movieQueries.all(), 'months'],
      queryFn: getDistinctWatchedMonths,
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

export const electricMovieCollection = createCollection(
  electricCollectionOptions({
    id: `movies`,
    getKey: (item: any) => item.id,
    shapeOptions: {
      url:
        import.meta.env.VITE_ELECTRIC_URL || `http://localhost:3000/v1/shape`,
      params: {
        table: 'movie',
      },
      onError: (error) => {
        // Handle offset out of bounds error by clearing stored state
        if (error.message?.includes('out of bounds')) {
          console.warn(
            'Electric shape offset out of bounds, clearing stored state...',
          )
          // The collection will automatically retry with a fresh offset
        }
        console.error('Electric movie collection sync error:', error)
      },
    },
  }),
)
