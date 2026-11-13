import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { eq, getTableColumns } from 'drizzle-orm'
import type { ShortlistWithUserMovies } from '@/db/schema'
import { db } from '@/db/db'
import {
  movie,
  movieToShortlist,
  shortlist,
  siteConfig,
  user,
} from '@/db/schema'
import { compactMovieImages } from '@/db/sql/movie-images'
import { adminMiddleware } from '@/middleware/admin'

export const getAdminShortlists = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .validator((data: Record<string, never>) => data)
  .handler(async (): Promise<Array<ShortlistWithUserMovies>> => {
    const rows = await db
      .select({
        shortlist,
        user: { id: user.id, name: user.name, image: user.image },
        movie: {
          ...getTableColumns(movie),
          images: compactMovieImages(movie.images),
        },
      })
      .from(shortlist)
      .innerJoin(user, eq(shortlist.userId, user.id))
      .leftJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .leftJoin(movie, eq(movieToShortlist.a, movie.id))

    const shortlists = new Map<string, ShortlistWithUserMovies>()

    for (const row of rows) {
      const current = shortlists.get(row.shortlist.id)
      if (current) {
        if (row.movie) {
          current.movies.push({
            ...row.movie,
          })
        }
        continue
      }

      shortlists.set(row.shortlist.id, {
        ...row.shortlist,
        user: row.user,
        movies: row.movie
          ? [
              {
                ...row.movie,
              },
            ]
          : [],
      })
    }

    return Array.from(shortlists.values())
  })

export const getAdminSiteConfig = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .validator((data: Record<string, never>) => data)
  .handler(async () => {
    const row = await db.select().from(siteConfig).limit(1)
    return (
      row[0] ?? {
        id: '',
        watchProviders: null,
        watchWeekDay: 'saturday',
        requireWinnerSelection: true,
      }
    )
  })

export const adminQueries = {
  shortlists: () =>
    queryOptions({
      queryKey: ['admin', 'shortlists'],
      queryFn: () => getAdminShortlists({ data: {} }),
      staleTime: 1000 * 60 * 5,
    }),
  siteConfig: () =>
    queryOptions({
      queryKey: ['admin', 'site-config'],
      queryFn: () => getAdminSiteConfig({ data: {} }),
    }),
}
