import { db } from '@/db/db'
import { movie, movieToShortlist, shortlist } from '@/db/schema'
import { Toast } from '@base-ui/react/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'

export const startRaffle = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const eligibleShortlists = await db
        .select()
        .from(shortlist)
        .where(
          and(eq(shortlist.isReady, true), eq(shortlist.participating, true)),
        )

      if (eligibleShortlists.length === 0) {
        throw new Error('No shortlists are ready and participating')
      }

      const eligibleMovies = await db
        .select({
          movie: movie,
          userId: shortlist.userId,
        })
        .from(movieToShortlist)
        .innerJoin(movie, eq(movieToShortlist.a, movie.id))
        .innerJoin(shortlist, eq(movieToShortlist.b, shortlist.id))
        .where(
          and(eq(shortlist.isReady, true), eq(shortlist.participating, true)),
        )

      if (eligibleMovies.length === 0) {
        throw new Error('No movies found in eligible shortlists')
      }

      const randomIndex = Math.floor(
        (crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) *
          eligibleMovies.length,
      )

      const winningEntry = eligibleMovies[randomIndex]

      return {
        success: true,
        movie: winningEntry.movie,
        userId: winningEntry.userId,
      }
    } catch (error) {
      console.error('Error starting raffle:', error)
      throw error
    }
  },
)

export const finalizeRaffle = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { movieId: string; watchDate: string; userId: string }) => data,
  )
  .handler(async ({ data }) => {
    const { movieId, watchDate, userId } = data

    try {
      await db
        .update(movie)
        .set({ watchDate: watchDate, userId: userId })
        .where(eq(movie.id, movieId))

      await db.delete(movieToShortlist).where(eq(movieToShortlist.a, movieId))

      await db
        .update(shortlist)
        .set({ isReady: false })
        .where(eq(shortlist.participating, true))

      return { success: true }
    } catch (error) {
      console.error('Error finalizing raffle:', error)
      throw error
    }
  })

export const useStartRaffleMutation = () => {
  const toastManager = Toast.useToastManager()

  return useMutation({
    mutationFn: async () => {
      const response = await startRaffle()

      if (!response.success) {
        throw new Error('Failed to start raffle')
      }

      return { movie: response.movie, userId: response.userId }
    },
    onError: (error) => {
      console.error('Error starting raffle:', error)
      toastManager.add({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to start raffle',
      })
    },
  })
}

export const useFinalizeRaffleMutation = () => {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  return useMutation({
    mutationFn: async ({
      movieId,
      watchDate,
      userId,
    }: {
      movieId: string
      watchDate: Date
      userId: string
    }) => {
      const response = await finalizeRaffle({
        data: { movieId, watchDate: watchDate.toISOString(), userId },
      })

      if (!response.success) {
        throw new Error('Failed to finalize raffle')
      }

      return response
    },
    onError: (error) => {
      console.error('Error finalizing raffle:', error)
      toastManager.add({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to finalize raffle. Please refresh the page.',
      })
    },
    onSuccess: () => {
      console.log('Successfully finalized raffle')
      queryClient.invalidateQueries({ queryKey: ['shortlists'] })
      queryClient.invalidateQueries({ queryKey: ['movies'] })
      toastManager.add({
        title: 'Raffle Complete!',
        description: 'The winning movie has been added to your watched list.',
      })
    },
  })
}
