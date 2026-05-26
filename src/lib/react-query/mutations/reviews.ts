import { Toast } from '@base-ui/react/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db/db'
import { review } from '@/db/schema/movies'
import { authMiddleware } from '@/middleware/auth'

const reviewInputSchema = z.object({
  movieId: z.string(),
  content: z.string().min(1, 'Review cannot be empty').max(10000),
  rating: z.number().min(0).max(5),
})

const updateReviewInputSchema = z.object({
  reviewId: z.string(),
  content: z.string().min(1, 'Review cannot be empty').max(10000),
  rating: z.number().min(0).max(5),
})

const deleteReviewInputSchema = z.object({
  reviewId: z.string(),
})

export type ReviewInput = z.infer<typeof reviewInputSchema>

export const createReview = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(reviewInputSchema)
  .handler(async ({ context, data }) => {
    if (!context.user) throw new Error('Unauthorized')

    const newReview = await db
      .insert(review)
      .values({
        id: crypto.randomUUID(),
        content: data.content,
        rating: data.rating,
        movieId: data.movieId,
        userId: context.user.userId,
      })
      .returning()

    return newReview[0]
  })

export const updateReview = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateReviewInputSchema)
  .handler(async ({ context, data }) => {
    if (!context.user) throw new Error('Unauthorized')

    const existing = await db
      .select()
      .from(review)
      .where(eq(review.id, data.reviewId))
      .limit(1)

    if (!existing[0] || existing[0].userId !== context.user.userId) {
      throw new Error('Unauthorized')
    }

    const updated = await db
      .update(review)
      .set({ content: data.content, rating: data.rating })
      .where(eq(review.id, data.reviewId))
      .returning()

    return updated[0]
  })

export const deleteReview = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteReviewInputSchema)
  .handler(async ({ context, data }) => {
    if (!context.user) throw new Error('Unauthorized')

    const existing = await db
      .select()
      .from(review)
      .where(eq(review.id, data.reviewId))
      .limit(1)

    if (!existing[0] || existing[0].userId !== context.user.userId) {
      throw new Error('Unauthorized')
    }

    await db.delete(review).where(eq(review.id, data.reviewId))

    return { success: true, movieId: existing[0].movieId }
  })

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  return useMutation({
    mutationFn: async (input: ReviewInput) => {
      const result = await createReview({ data: input })
      return result
    },
    onMutate: async ({ movieId, content, rating }) => {
      await queryClient.cancelQueries({
        queryKey: ['reviews', 'movie', movieId],
      })

      const previous = queryClient.getQueryData(['reviews', 'movie', movieId])

      const optimisticReview = {
        id: `optimistic-${Date.now()}`,
        content,
        rating,
        movieId,
        createdAt: new Date(),
        user: {
          id: '',
          name: '',
          image: '',
        },
      }

      queryClient.setQueryData(
        ['reviews', 'movie', movieId],
        (old: Array<typeof optimisticReview> | undefined) => {
          if (!old) return [optimisticReview]
          return [optimisticReview, ...old]
        },
      )

      return { previous, movieId }
    },
    onError: (error, { movieId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['reviews', 'movie', movieId],
          context.previous,
        )
      }
      toastManager.add({
        title: 'Error',
        description: error.message || 'Failed to save review',
        type: 'error',
      })
    },
    onSettled: (_data, _error, { movieId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'movie', movieId] })
    },
    onSuccess: (_data, { movieId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'movie', movieId] })
      toastManager.add({
        title: 'Review shared',
        description: 'Your thoughts have been added to the club journal',
        type: 'success',
      })
    },
  })
}

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  return useMutation({
    mutationFn: async (input: z.infer<typeof updateReviewInputSchema>) => {
      const result = await updateReview({ data: input })
      return result
    },
    onMutate: async ({ reviewId, content, rating }) => {
      const movieQueryKey = ['reviews', 'movie']

      const allKeys = queryClient
        .getQueryCache()
        .findAll({ queryKey: movieQueryKey })

      let movieId = ''

      for (const query of allKeys) {
        const data = queryClient.getQueryData<
          Array<{
            id: string
            content: string
            rating: number
            movieId: string
          }>
        >(query.queryKey)
        if (data) {
          const found = data.find((r) => r.id === reviewId)
          if (found) {
            movieId = found.movieId
            break
          }
        }
      }

      if (movieId) {
        await queryClient.cancelQueries({
          queryKey: ['reviews', 'movie', movieId],
        })

        const previous = queryClient.getQueryData(['reviews', 'movie', movieId])

        queryClient.setQueryData(
          ['reviews', 'movie', movieId],
          (
            old:
              | Array<{
                  id: string
                  content: string
                  rating: number
                  movieId: string
                }>
              | undefined,
          ) => {
            if (!old) return old
            return old.map((r) =>
              r.id === reviewId ? { ...r, content, rating } : r,
            )
          },
        )

        return { previous, movieId }
      }
    },
    onError: (error, _vars, context) => {
      if (context?.previous && context.movieId) {
        queryClient.setQueryData(
          ['reviews', 'movie', context.movieId],
          context.previous,
        )
      }
      toastManager.add({
        title: 'Error',
        description: error.message || 'Failed to update review',
        type: 'error',
      })
    },
    onSettled: (_data, _error, _vars, context) => {
      if (context?.movieId) {
        queryClient.invalidateQueries({
          queryKey: ['reviews', 'movie', context.movieId],
        })
      }
    },
    onSuccess: (_data, _vars, context) => {
      if (context?.movieId) {
        queryClient.invalidateQueries({
          queryKey: ['reviews', 'movie', context.movieId],
        })
      }
      toastManager.add({
        title: 'Review updated',
        description: 'Your thoughts have been updated',
        type: 'success',
      })
    },
  })
}

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const result = await deleteReview({ data: { reviewId } })
      return result
    },
    onMutate: async (reviewId) => {
      const movieQueryKey = ['reviews', 'movie']

      const allKeys = queryClient
        .getQueryCache()
        .findAll({ queryKey: movieQueryKey })

      let movieId = ''

      for (const query of allKeys) {
        const data = queryClient.getQueryData<
          Array<{ id: string; movieId: string }>
        >(query.queryKey)
        if (data) {
          const found = data.find((r) => r.id === reviewId)
          if (found) {
            movieId = found.movieId
            break
          }
        }
      }

      if (movieId) {
        await queryClient.cancelQueries({
          queryKey: ['reviews', 'movie', movieId],
        })

        const previous = queryClient.getQueryData(['reviews', 'movie', movieId])

        queryClient.setQueryData(
          ['reviews', 'movie', movieId],
          (old: Array<{ id: string }> | undefined) => {
            if (!old) return old
            return old.filter((r) => r.id !== reviewId)
          },
        )

        return { previous, movieId }
      }
    },
    onError: (error, _reviewId, context) => {
      if (context?.previous && context.movieId) {
        queryClient.setQueryData(
          ['reviews', 'movie', context.movieId],
          context.previous,
        )
      }
      toastManager.add({
        title: 'Error',
        description: error.message || 'Failed to delete review',
        type: 'error',
      })
    },
    onSettled: (_data, _error, _reviewId, context) => {
      if (context?.movieId) {
        queryClient.invalidateQueries({
          queryKey: ['reviews', 'movie', context.movieId],
        })
      }
    },
    onSuccess: (_data, _reviewId, context) => {
      if (context?.movieId) {
        queryClient.invalidateQueries({
          queryKey: ['reviews', 'movie', context.movieId],
        })
      }
      toastManager.add({
        title: 'Review deleted',
        description: 'Your review has been removed',
        type: 'success',
      })
    },
  })
}
