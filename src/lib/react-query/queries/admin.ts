import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import type { ShortlistWithUserMovies } from '@/db/schema'
import { db } from '@/db/db'
import {
  movie,
  movieCredits,
  movieToShortlist,
  shortlist,
  siteConfig,
  user,
} from '@/db/schema'
import { adminMiddleware } from '@/middleware/admin'

export const getAdminShortlists = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: Record<string, never>) => data)
  .handler(async (): Promise<Array<ShortlistWithUserMovies>> => {
    const rows = await db
      .select()
      .from(shortlist)
      .innerJoin(user, eq(shortlist.userId, user.id))
      .leftJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .leftJoin(movie, eq(movieToShortlist.a, movie.id))
      .leftJoin(movieCredits, eq(movieCredits.id, movie.id))

    const shortlists = new Map<string, ShortlistWithUserMovies>()

    for (const row of rows) {
      const current = shortlists.get(row.shortlist.id)
      if (current) {
        if (row.movie) {
          current.movies.push({
            ...row.movie,
            cast: row.movie_credits?.cast ?? null,
            crew: row.movie_credits?.crew ?? null,
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
                cast: row.movie_credits?.cast ?? null,
                crew: row.movie_credits?.crew ?? null,
              },
            ]
          : [],
      })
    }

    return Array.from(shortlists.values())
  })

export const getAdminSiteConfig = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: Record<string, never>) => data)
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
