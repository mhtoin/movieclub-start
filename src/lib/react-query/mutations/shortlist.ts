import { db } from '@/db/db'
import { movie, movieToShortlist, shortlist } from '@/db/schema'
import { user } from '@/db/schema/users'
import { getSessionUser, useAppSession } from '@/lib/auth/auth'
import { createDbMovie, generateAndUpdateBlurData } from '@/lib/createDbMovie'
import { fetchMovieDetails } from '@/lib/tmdb-api'
import { Toast } from '@base-ui/react/toast'
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
    const rows = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .leftJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .leftJoin(movie, eq(movieToShortlist.a, movie.id))

    if (rows.length === 0) {
      throw new Error('Shortlist not found after deletion')
    }

    const updatedShortlist = {
      ...rows[0].shortlist,
      movies: rows.flatMap((row) => (row.movie ? [row.movie] : [])),
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
    const rows = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .leftJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .leftJoin(movie, eq(movieToShortlist.a, movie.id))

    const updatedShortlist = {
      ...rows[0].shortlist,
      movies: rows.flatMap((row) => (row.movie ? [row.movie] : [])),
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
      queryClient.setQueryData(['shortlist', shortlist.userId], shortlist)
      queryClient.invalidateQueries({
        queryKey: ['shortlist', shortlist.userId],
      })
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
      queryClient.setQueryData(['shortlist', shortlist.userId], shortlist)
      queryClient.invalidateQueries({
        queryKey: ['shortlist', shortlist.userId],
      })
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
    const rows = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .leftJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .leftJoin(movie, eq(movieToShortlist.a, movie.id))

    if (rows.length === 0) {
      throw new Error('Shortlist not found after update')
    }

    const updatedShortlist = {
      ...rows[0].shortlist,
      movies: rows.flatMap((row) => (row.movie ? [row.movie] : [])),
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
    const rows = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .leftJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .leftJoin(movie, eq(movieToShortlist.a, movie.id))

    if (rows.length === 0) {
      throw new Error('Shortlist not found after update')
    }

    const updatedShortlist = {
      ...rows[0].shortlist,
      movies: rows.flatMap((row) => (row.movie ? [row.movie] : [])),
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

export const updateUserShortlistStatus = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { userId: string; isReady?: boolean; participating?: boolean }) =>
      data,
  )
  .handler(async ({ data }) => {
    const { userId, isReady, participating } = data
    const session = await useAppSession()
    const sessionToken = session.data?.sessionToken
    const sessionUser = await getSessionUser(sessionToken)

    if (!sessionUser) {
      throw new Error('Unauthorized')
    }

    const targetShortlist = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, userId))
      .limit(1)
      .then((res) => res[0])

    if (!targetShortlist) {
      throw new Error('Shortlist not found')
    }

    const updates: Partial<typeof shortlist.$inferInsert> = {}
    if (isReady !== undefined) updates.isReady = isReady
    if (participating !== undefined) updates.participating = participating

    await db
      .update(shortlist)
      .set(updates)
      .where(eq(shortlist.id, targetShortlist.id))

    // Get the updated shortlist with all its movies
    const rows = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, userId))
      .leftJoin(user, eq(shortlist.userId, user.id))
      .leftJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .leftJoin(movie, eq(movieToShortlist.a, movie.id))

    if (rows.length === 0) {
      throw new Error('Shortlist not found after update')
    }

    const updatedShortlist = {
      ...rows[0].shortlist,
      user: rows[0].user!,
      movies: rows.flatMap((row) => (row.movie ? [row.movie] : [])),
    }

    return { success: true, shortlist: updatedShortlist }
  })

export const useUpdateUserShortlistStatusMutation = () => {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()
  return useMutation({
    mutationFn: async ({
      userId,
      isReady,
      participating,
    }: {
      userId: string
      isReady?: boolean
      participating?: boolean
    }) => {
      const response = await updateUserShortlistStatus({
        data: { userId, isReady, participating },
      })

      if (!response.success) {
        throw new Error('Failed to update user shortlist status')
      }
      return response.shortlist
    },
    onError: (error) => {
      console.error('Error updating user shortlist status:', error)
      toastManager.add({
        title: 'Error',
        description: 'Failed to update user status',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlists'] })
    },
  })
}

export const updateSelectedIndex = createServerFn({ method: 'POST' })
  .inputValidator((data: { selectedIndex: number | null }) => data)
  .handler(async ({ data }) => {
    const { selectedIndex } = data
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
      .set({ selectedIndex })
      .where(eq(shortlist.id, userShortlist.id))

    // Get the updated shortlist with all its movies
    const rows = await db
      .select()
      .from(shortlist)
      .where(eq(shortlist.userId, user.userId))
      .leftJoin(movieToShortlist, eq(shortlist.id, movieToShortlist.b))
      .leftJoin(movie, eq(movieToShortlist.a, movie.id))

    if (rows.length === 0) {
      throw new Error('Shortlist not found after update')
    }

    const updatedShortlist = {
      ...rows[0].shortlist,
      movies: rows.flatMap((row) => (row.movie ? [row.movie] : [])),
    }

    return { success: true, shortlist: updatedShortlist }
  })

export const useUpdateSelectedIndexMutation = () => {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()
  return useMutation({
    mutationFn: async (selectedIndex: number | null) => {
      const response = await updateSelectedIndex({ data: { selectedIndex } })

      if (!response.success) {
        throw new Error('Failed to update selected movie')
      }
      return response.shortlist
    },
    onError: (error) => {
      console.error('Error updating selected movie:', error)
      toastManager.add({
        title: 'Error',
        description: 'Failed to update selection',
      })
    },
    onSuccess: (shortlist) => {
      queryClient.setQueryData(['shortlist', shortlist.userId], shortlist)
      toastManager.add({
        title: 'Success',
        description:
          shortlist.selectedIndex !== null
            ? 'Movie selected for raffle'
            : 'Selection cleared',
      })
    },
  })
}
