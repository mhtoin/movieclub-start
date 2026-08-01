import { Toast } from '@base-ui/react/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db/db'
import {
  movie,
  movieCredits,
  movieToShortlist,
  raffle as raffleTable,
  raffleToUser,
  shortlist,
} from '@/db/schema'
import { createDbMovie, generateAndUpdateBlurData } from '@/lib/createDbMovie'
import { fetchMovieDetails } from '@/lib/tmdb-api'
import { adminMiddleware } from '@/middleware/admin'

const addWatchedMovieSchema = z
  .object({
    movieId: z.string().min(1).optional(),
    tmdbId: z.number().int().positive().optional(),
    userId: z.string().min(1),
    watchDate: z.string().min(1),
  })
  .refine((data) => Boolean(data.movieId) !== Boolean(data.tmdbId), {
    message: 'Provide either a shortlist movie or a TMDB movie',
  })

export const addWatchedMovie = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data) => addWatchedMovieSchema.parse(data))
  .handler(async ({ data }) => {
    const watchDate = new Date(data.watchDate)
    if (Number.isNaN(watchDate.getTime())) {
      throw new Error('Invalid watch date')
    }

    const movieData = data.tmdbId
      ? createDbMovie(await fetchMovieDetails(data.tmdbId))
      : null

    const result = await db.transaction(async (tx) => {
      let movieId = data.movieId

      if (movieData) {
        const existingTmdbMovie = await tx
          .select({ id: movie.id })
          .from(movie)
          .where(eq(movie.tmdbId, data.tmdbId!))
          .limit(1)

        if (existingTmdbMovie[0]) {
          movieId = existingTmdbMovie[0].id
        } else {
          const { credits, ...movieInsertFields } = movieData
          movieId = crypto.randomUUID()
          await tx.insert(movie).values({
            id: movieId,
            ...movieInsertFields,
          })
          await tx.insert(movieCredits).values({
            id: movieId,
            cast: credits.cast,
            crew: credits.crew,
          })
        }
      }

      const shortlistEntry = await tx
        .select({ shortlistId: shortlist.id })
        .from(shortlist)
        .innerJoin(movieToShortlist, eq(movieToShortlist.b, shortlist.id))
        .where(
          and(
            eq(shortlist.userId, data.userId),
            eq(movieToShortlist.a, movieId!),
          ),
        )
        .limit(1)

      if (!movieData && shortlistEntry.length === 0) {
        throw new Error("Movie is not in the selected user's shortlist")
      }

      const existingMovie = await tx
        .select({ watchDate: movie.watchDate })
        .from(movie)
        .where(eq(movie.id, movieId!))
        .limit(1)

      if (existingMovie.length === 0) {
        throw new Error('Movie not found')
      }
      if (existingMovie[0].watchDate) {
        throw new Error('Movie has already been marked as watched')
      }

      const raffleId = crypto.randomUUID()
      await tx.insert(raffleTable).values({
        id: raffleId,
        winningMovieId: movieId!,
        raffledAt: watchDate,
      })
      await tx.insert(raffleToUser).values({ a: raffleId, b: data.userId })
      await tx
        .update(movie)
        .set({ watchDate, userId: data.userId })
        .where(eq(movie.id, movieId!))
      await tx.delete(movieToShortlist).where(eq(movieToShortlist.a, movieId!))
      await tx
        .update(shortlist)
        .set({ isReady: false })
        .where(eq(shortlist.participating, true))
      await tx
        .update(shortlist)
        .set({ requiresSelection: true, selectedIndex: null })
        .where(
          and(
            eq(shortlist.userId, data.userId),
            eq(shortlist.participating, true),
          ),
        )
      await tx
        .update(shortlist)
        .set({ requiresSelection: false, selectedIndex: null })
        .where(
          and(
            ne(shortlist.userId, data.userId),
            eq(shortlist.participating, true),
          ),
        )

      return { success: true, raffleId, movieId: movieId! }
    })

    if (movieData) {
      generateAndUpdateBlurData(result.movieId, movieData.images).catch(
        (error) => console.error('Background blur generation failed:', error),
      )
    }

    return result
  })

export function useAddWatchedMovieMutation() {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  return useMutation({
    mutationFn: (data: {
      movieId?: string
      tmdbId?: number
      userId: string
      watchDate: Date
    }) =>
      addWatchedMovie({
        data: { ...data, watchDate: data.watchDate.toISOString() },
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shortlists'] })
      queryClient.invalidateQueries({ queryKey: ['shortlists'] })
      queryClient.invalidateQueries({ queryKey: ['movies'] })
      queryClient.invalidateQueries({ queryKey: ['raffle', 'history'] })
    },
    onSuccess: () => {
      toastManager.add({
        title: 'Movie recorded',
        description: 'The movie was added to the watched history.',
        type: 'success',
      })
    },
    onError: (error) => {
      toastManager.add({
        title: 'Could not record movie',
        description: error instanceof Error ? error.message : 'Try again.',
        type: 'error',
      })
    },
  })
}
