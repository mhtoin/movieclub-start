import { db } from '@/db/db'
import { movie, movieToShortlist, shortlist } from '@/db/schema'
import { getSessionUser, useAppSession } from '@/lib/auth/auth'
import { createDbMovie, generateAndUpdateBlurData } from '@/lib/createDbMovie'
import { fetchMovieDetails } from '@/lib/tmdb-api'
import { Toast } from '@base-ui-components/react/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'

export const removeFromShortlist = createServerFn({ method: 'POST' })
  .inputValidator((data: { movieId: string }) => data)
  .handler(async ({ data }) => {
    const { movieId } = data
    const session = await useAppSession()
    const sessionToken = session.data?.sessionToken
    const user = await getSessionUser(sessionToken)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const userShortlist = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .limit(1)
      .then((res) => res[0])

    if (!userShortlist) {
      throw new Error('Shortlist not found')
    }
    await db
      .delete(movieToShortlist)
      .where(
        and(
          eq(movieToShortlist.a, movieId),
          eq(movieToShortlist.b, userShortlist.id),
        ),
      )

    // Get the shortlist with all its movies
    const shortlistWithMovies = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .innerJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .innerJoin(movie, eq(movieToShortlist.a, movie.id))

    // Transform the result into a more useful structure
    const updatedShortlist =
      shortlistWithMovies.length > 0
        ? {
            ...shortlistWithMovies[0].shortlist,
            movies: shortlistWithMovies.map((row) => row.movie),
          }
        : null

    if (!updatedShortlist) {
      throw new Error('Shortlist not found after deletion')
    }

    return { success: true, shortlist: updatedShortlist }
  })

export const addToShortlist = createServerFn({ method: 'POST' })
  .inputValidator((data: { movieId: number }) => data)
  .handler(async ({ data }) => {
    const { movieId } = data
    const session = await useAppSession()
    const sessionToken = session.data?.sessionToken
    const user = await getSessionUser(sessionToken)

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Parallelize shortlist and movie queries
    const [userShortlist, existingEntry] = await Promise.all([
      db
        .select()
        .from(shortlist)
        .where(eq(shortlist.userId, user.userId))
        .limit(1)
        .then((res) => res[0]),
      db
        .select()
        .from(movie)
        .where(eq(movie.tmdbId, movieId))
        .limit(1)
        .then((res) => res[0]),
    ])

    if (!userShortlist) {
      throw new Error('Shortlist not found')
    }

    let movieEntry = existingEntry

    if (!movieEntry) {
      const movieDetailsResponse = await fetchMovieDetails(movieId)

      if (!movieDetailsResponse) {
        throw new Error('Failed to fetch movie details from TMDB')
      }

      const movieData = await createDbMovie(movieDetailsResponse)

      const newMovie = await db
        .insert(movie)
        .values({
          id: crypto.randomUUID(),
          ...movieData,
        })
        .returning()

      if (newMovie.length === 0) {
        throw new Error('Failed to insert movie into the database')
      }
      movieEntry = newMovie[0]

      // Generate blur data asynchronously in the background
      if (movieData.images) {
        generateAndUpdateBlurData(movieEntry.id, movieData.images).catch(
          (error) => {
            console.error('Background blur generation failed:', error)
          },
        )
      }
    }

    await db.insert(movieToShortlist).values({
      a: movieEntry.id,
      b: userShortlist.id,
    })

    // Get the updated shortlist with all its movies
    const shortlistWithMovies = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .innerJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .innerJoin(movie, eq(movieToShortlist.a, movie.id))

    const updatedShortlist = {
      ...shortlistWithMovies[0].shortlist,
      movies: shortlistWithMovies.map((row) => row.movie),
    }

    return { success: true, shortlist: updatedShortlist }
  })

export const useRemoveFromShortlistMutation = () => {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()
  return useMutation({
    mutationFn: async (movieId: string) => {
      const response = await removeFromShortlist({ data: { movieId } })

      if (!response.success) {
        throw new Error('Failed to remove movie from shortlist')
      }
      return response.shortlist
    },
    onError: (error) => {
      console.error('Error removing movie from shortlist:', error)
      toastManager.add({
        title: 'Error',
        description: 'Failed to remove movie from shortlist',
      })
    },
    onSuccess: (shortlist) => {
      console.log('Successfully removed movie from shortlist:', shortlist)
      queryClient.setQueryData(['shortlist', shortlist.userId], shortlist)
      toastManager.add({
        title: 'Success',
        description: 'Movie removed from shortlist',
      })
    },
  })
}

export const useAddToShortlistMutation = () => {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()
  return useMutation({
    mutationFn: async (movieId: number) => {
      const response = await addToShortlist({ data: { movieId } })

      if (!response.success) {
        throw new Error('Failed to add movie to shortlist')
      }
      return response.shortlist
    },
    onError: (error) => {
      console.error('Error adding movie to shortlist:', error)
      toastManager.add({
        title: 'Error',
        description: 'Failed to add movie to shortlist',
      })
    },
    onSuccess: (shortlist) => {
      console.log('Successfully added movie to shortlist:', shortlist)
      queryClient.setQueryData(['shortlist', shortlist.userId], shortlist)
      toastManager.add({
        title: 'Success',
        description: 'Movie added to shortlist',
      })
    },
  })
}

export const toggleIsReady = createServerFn({ method: 'POST' })
  .inputValidator((data: { isReady: boolean }) => data)
  .handler(async ({ data }) => {
    const { isReady } = data
    const session = await useAppSession()
    const sessionToken = session.data?.sessionToken
    const user = await getSessionUser(sessionToken)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const userShortlist = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .limit(1)
      .then((res) => res[0])

    if (!userShortlist) {
      throw new Error('Shortlist not found')
    }

    await db
      .update(shortlist)
      .set({ isReady })
      .where(eq(shortlist.id, userShortlist.id))

    // Get the updated shortlist with all its movies
    const shortlistWithMovies = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .innerJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .innerJoin(movie, eq(movieToShortlist.a, movie.id))

    const updatedShortlist =
      shortlistWithMovies.length > 0
        ? {
            ...shortlistWithMovies[0].shortlist,
            movies: shortlistWithMovies.map((row) => row.movie),
          }
        : null

    if (!updatedShortlist) {
      throw new Error('Shortlist not found after update')
    }

    return { success: true, shortlist: updatedShortlist }
  })

export const toggleParticipating = createServerFn({ method: 'POST' })
  .inputValidator((data: { participating: boolean }) => data)
  .handler(async ({ data }) => {
    const { participating } = data
    const session = await useAppSession()
    const sessionToken = session.data?.sessionToken
    const user = await getSessionUser(sessionToken)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const userShortlist = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .limit(1)
      .then((res) => res[0])

    if (!userShortlist) {
      throw new Error('Shortlist not found')
    }

    await db
      .update(shortlist)
      .set({ participating })
      .where(eq(shortlist.id, userShortlist.id))

    // Get the updated shortlist with all its movies
    const shortlistWithMovies = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .innerJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .innerJoin(movie, eq(movieToShortlist.a, movie.id))

    const updatedShortlist =
      shortlistWithMovies.length > 0
        ? {
            ...shortlistWithMovies[0].shortlist,
            movies: shortlistWithMovies.map((row) => row.movie),
          }
        : null

    if (!updatedShortlist) {
      throw new Error('Shortlist not found after update')
    }

    return { success: true, shortlist: updatedShortlist }
  })

export const useToggleIsReadyMutation = () => {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()
  return useMutation({
    mutationFn: async (isReady: boolean) => {
      const response = await toggleIsReady({ data: { isReady } })

      if (!response.success) {
        throw new Error('Failed to update ready status')
      }
      return response.shortlist
    },
    onError: (error) => {
      console.error('Error updating ready status:', error)
      toastManager.add({
        title: 'Error',
        description: 'Failed to update ready status',
      })
    },
    onSuccess: (shortlist) => {
      queryClient.setQueryData(['shortlist', shortlist.userId], shortlist)
      toastManager.add({
        title: 'Success',
        description: shortlist.isReady
          ? 'Marked as ready to watch'
          : 'Marked as in progress',
      })
    },
  })
}

export const useToggleParticipatingMutation = () => {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()
  return useMutation({
    mutationFn: async (participating: boolean) => {
      const response = await toggleParticipating({ data: { participating } })

      if (!response.success) {
        throw new Error('Failed to update participation status')
      }
      return response.shortlist
    },
    onError: (error) => {
      console.error('Error updating participation status:', error)
      toastManager.add({
        title: 'Error',
        description: 'Failed to update participation status',
      })
    },
    onSuccess: (shortlist) => {
      queryClient.setQueryData(['shortlist', shortlist.userId], shortlist)
      toastManager.add({
        title: 'Success',
        description: shortlist.participating
          ? 'Now participating in movie night'
          : 'No longer participating in movie night',
      })
    },
  })
}
