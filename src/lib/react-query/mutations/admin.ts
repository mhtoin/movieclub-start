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
  siteConfig,
} from '@/db/schema'
import { createDbMovie, generateAndUpdateBlurData } from '@/lib/createDbMovie'
import { fetchMovieDetails } from '@/lib/tmdb-api'
import { adminMiddleware } from '@/middleware/admin'

export const MOVIE_ALREADY_WATCHED_ERROR = 'MOVIE_ALREADY_WATCHED'

const siteConfigSchema = z.object({
  watchWeekDay: z.enum([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]),
  watchProviders: z.record(z.string(), z.json()).nullable(),
  requireWinnerSelection: z.boolean(),
})

export const updateSiteConfig = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data) => siteConfigSchema.parse(data))
  .handler(async ({ data }) => {
    const existing = await db
      .select({ id: siteConfig.id })
      .from(siteConfig)
      .limit(1)

    if (existing[0]) {
      return db
        .update(siteConfig)
        .set(data)
        .where(eq(siteConfig.id, existing[0].id))
        .returning()
        .then((rows) => rows[0])
    }

    return db
      .insert(siteConfig)
      .values({ id: crypto.randomUUID(), ...data })
      .returning()
      .then((rows) => rows[0])
  })

export function useUpdateSiteConfig() {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  return useMutation({
    mutationFn: (data: z.infer<typeof siteConfigSchema>) =>
      updateSiteConfig({ data }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'site-config'] })
      queryClient.invalidateQueries({
        queryKey: ['site-config', 'provider-ids'],
      })
      queryClient.invalidateQueries({ queryKey: ['site-config', 'settings'] })
      queryClient.invalidateQueries({ queryKey: ['shortlist'] })
      queryClient.invalidateQueries({ queryKey: ['shortlists', 'all'] })
    },
    onSuccess: () =>
      toastManager.add({
        title: 'Site configuration saved',
        description: 'The shared site settings were updated.',
        type: 'success',
      }),
    onError: (error) =>
      toastManager.add({
        title: 'Could not save site configuration',
        description: error instanceof Error ? error.message : 'Try again.',
        type: 'error',
      }),
  })
}

const adminShortlistMovieSchema = z.object({
  userId: z.string().min(1),
  tmdbId: z.number().int().positive(),
})

export const addMovieToUserShortlist = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data) => adminShortlistMovieSchema.parse(data))
  .handler(async ({ data }) => {
    const targetShortlist = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, data.userId))
      .limit(1)
      .then((rows) => rows[0])

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!targetShortlist) throw new Error('Shortlist not found')

    const currentMovies = await db
      .select({ id: movie.id, watchDate: movie.watchDate })
      .from(movieToShortlist)
      .innerJoin(movie, eq(movieToShortlist.a, movie.id))
      .where(eq(movieToShortlist.b, targetShortlist.id))

    if (currentMovies.length >= 3) {
      throw new Error('This shortlist is full (maximum 3 movies)')
    }

    const existingMovie = await db
      .select()
      .from(movie)
      .where(eq(movie.tmdbId, data.tmdbId))
      .limit(1)
      .then((rows) => rows[0])

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (existingMovie?.watchDate) {
      throw new Error('This movie has already been watched')
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    let movieId = existingMovie?.id
    if (!movieId) {
      const movieData = createDbMovie(await fetchMovieDetails(data.tmdbId))
      const { credits, ...movieInsertFields } = movieData
      movieId = crypto.randomUUID()
      await db.insert(movie).values({ id: movieId, ...movieInsertFields })
      await db.insert(movieCredits).values({
        id: movieId,
        cast: credits.cast,
        crew: credits.crew,
      })
      generateAndUpdateBlurData(movieId, movieData.images).catch((error) =>
        console.error('Background blur generation failed:', error),
      )
    }

    if (currentMovies.some((entry) => entry.id === movieId)) {
      throw new Error('This movie is already in the shortlist')
    }

    await db.insert(movieToShortlist).values({
      a: movieId,
      b: targetShortlist.id,
    })

    return { success: true, userId: data.userId }
  })

export const removeMovieFromUserShortlist = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data) =>
    z
      .object({ userId: z.string().min(1), movieId: z.string().min(1) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const targetShortlist = await db
      .select({ id: shortlist.id })
      .from(shortlist)
      .where(eq(shortlist.userId, data.userId))
      .limit(1)
      .then((rows) => rows[0])

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!targetShortlist) throw new Error('Shortlist not found')

    await db
      .delete(movieToShortlist)
      .where(
        and(
          eq(movieToShortlist.a, data.movieId),
          eq(movieToShortlist.b, targetShortlist.id),
        ),
      )

    return { success: true, userId: data.userId }
  })

export function useAdminShortlistMutation() {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  const invalidate = (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'shortlists'] })
    queryClient.invalidateQueries({ queryKey: ['shortlist', userId] })
    queryClient.invalidateQueries({ queryKey: ['shortlists'] })
  }

  const add = useMutation({
    mutationFn: ({ userId, tmdbId }: { userId: string; tmdbId: number }) =>
      addMovieToUserShortlist({ data: { userId, tmdbId } }),
    onSettled: (_data, _error, variables) => invalidate(variables.userId),
    onSuccess: () =>
      toastManager.add({
        title: 'Movie added',
        description: "The user's shortlist was updated.",
        type: 'success',
      }),
    onError: (error) =>
      toastManager.add({
        title: 'Could not add movie',
        description: error instanceof Error ? error.message : 'Try again.',
        type: 'error',
      }),
  })

  const remove = useMutation({
    mutationFn: ({ userId, movieId }: { userId: string; movieId: string }) =>
      removeMovieFromUserShortlist({ data: { userId, movieId } }),
    onSettled: (_data, _error, variables) => invalidate(variables.userId),
    onSuccess: () =>
      toastManager.add({
        title: 'Movie removed',
        description: "The user's shortlist was updated.",
        type: 'success',
      }),
    onError: (error) =>
      toastManager.add({
        title: 'Could not remove movie',
        description: error instanceof Error ? error.message : 'Try again.',
        type: 'error',
      }),
  })

  return { add, remove }
}

const addWatchedMovieSchema = z
  .object({
    movieId: z.string().min(1).optional(),
    tmdbId: z.number().int().positive().optional(),
    userId: z.string().min(1),
    watchDate: z.string().min(1),
    allowAlreadyWatched: z.boolean().default(false),
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

    const config = await db
      .select({ requireWinnerSelection: siteConfig.requireWinnerSelection })
      .from(siteConfig)
      .limit(1)
    const requireWinnerSelection = config[0]?.requireWinnerSelection ?? true

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
      if (existingMovie[0].watchDate && !data.allowAlreadyWatched) {
        throw new Error(MOVIE_ALREADY_WATCHED_ERROR)
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
      if (requireWinnerSelection) {
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
      } else {
        await tx
          .update(shortlist)
          .set({ requiresSelection: false, selectedIndex: null })
          .where(eq(shortlist.participating, true))
      }

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
      allowAlreadyWatched?: boolean
    }) =>
      addWatchedMovie({
        data: {
          ...data,
          watchDate: data.watchDate.toISOString(),
          allowAlreadyWatched: data.allowAlreadyWatched ?? false,
        },
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
      if (
        error instanceof Error &&
        error.message === MOVIE_ALREADY_WATCHED_ERROR
      ) {
        return
      }
      toastManager.add({
        title: 'Could not record movie',
        description: error instanceof Error ? error.message : 'Try again.',
        type: 'error',
      })
    },
  })
}
