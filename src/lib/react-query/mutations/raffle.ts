import { db } from '@/db/db'
import { movie, movieToShortlist, shortlist } from '@/db/schema'
import { Toast } from '@base-ui-components/react/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'

export const startRaffle = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      // Get all shortlists that are both ready and participating
      const eligibleShortlists = await db
        .select()
        .from(shortlist)
        .where(
          and(eq(shortlist.isReady, true), eq(shortlist.participating, true)),
        )

      if (eligibleShortlists.length === 0) {
        throw new Error('No shortlists are ready and participating')
      }

      // Get all movies from eligible shortlists
      const eligibleMovies = await db
        .select({
          movie: movie,
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

      const winningMovie = eligibleMovies[randomIndex].movie

      return { success: true, movie: winningMovie }
    } catch (error) {
      console.error('Error starting raffle:', error)
      throw error
    }
  },
)

export const useStartRaffleMutation = () => {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  return useMutation({
    mutationFn: async () => {
      const response = await startRaffle()

      if (!response.success) {
        throw new Error('Failed to start raffle')
      }

      return response.movie
    },
    onError: (error) => {
      console.error('Error starting raffle:', error)
      toastManager.add({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to start raffle',
      })
    },
    onSuccess: (movie) => {
      console.log('Successfully selected winning movie:', movie)
      toastManager.add({
        title: 'Winner Selected!',
        description: `${movie.title} has been selected!`,
      })
      // Optionally invalidate queries if needed
      queryClient.invalidateQueries({ queryKey: ['shortlists', 'all'] })
    },
  })
}
