import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db/db'
import { movie, movieCredits, review } from '@/db/schema/movies'
import { user } from '@/db/schema/users'
import { authMiddleware } from '@/middleware/auth'

const THIRTY_MINUTES = 1000 * 60 * 30

export const getMovieById = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ movieId: z.string() }))
  .handler(async ({ context, data }) => {
    if (!context.user) throw new Error('Unauthorized')

    const rows = await db
      .select()
      .from(movie)
      .leftJoin(movieCredits, eq(movieCredits.id, movie.id))
      .leftJoin(user, eq(user.id, movie.userId))
      .where(eq(movie.id, data.movieId))
      .limit(1)

    if (rows.length === 0) return null

    const row = rows[0]
    return {
      movie: {
        ...row.movie,
        cast: row.movie_credits?.cast ?? null,
        crew: row.movie_credits?.crew ?? null,
      },
      picker: row.user,
    }
  })

export const getMovieReviews = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ movieId: z.string() }))
  .handler(async ({ context, data }) => {
    if (!context.user) throw new Error('Unauthorized')

    const reviews = await db
      .select()
      .from(review)
      .leftJoin(user, eq(user.id, review.userId))
      .where(eq(review.movieId, data.movieId))
      .orderBy(desc(review.createdAt))

    return reviews.map((r) => ({
      id: r.review.id,
      content: r.review.content,
      rating: r.review.rating,
      createdAt: r.review.createdAt,
      movieId: r.review.movieId,
      user: r.user
        ? {
            id: r.user.id,
            name: r.user.name,
            image: r.user.image,
          }
        : null,
    }))
  })

export const reviewQueries = {
  all: () => ['reviews'],
  byMovie: (movieId: string) =>
    queryOptions({
      queryKey: [...reviewQueries.all(), 'movie', movieId],
      queryFn: async () => {
        const result = await getMovieReviews({ data: { movieId } })
        return result
      },
      staleTime: THIRTY_MINUTES,
    }),
}

export const movieDetailQuery = (movieId: string) =>
  queryOptions({
    queryKey: ['movies', 'detail', movieId],
    queryFn: async () => {
      const result = await getMovieById({ data: { movieId } })
      return result
    },
    staleTime: THIRTY_MINUTES,
  })
