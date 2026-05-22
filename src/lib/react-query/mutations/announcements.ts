import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { Slide } from '@/db/schema/announcements'
import {
  createAnnouncement,
  deleteAnnouncement,
  dismissAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
} from '@/db/queries/announcements'
import { adminMiddleware } from '@/middleware/admin'
import { authMiddleware } from '@/middleware/auth'

const slideSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
})

export const dismissAnnouncementFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      announcementId: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    if (!context.user) throw new Error('Unauthorized')
    await dismissAnnouncement(context.user.userId, data.announcementId)
    return { success: true }
  })

// Admin server functions
export const getAllAnnouncementsFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return getAllAnnouncements()
  })

const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['whats-new', 'bulletin']),
  isPublished: z.boolean(),
  priority: z.number().int().default(0),
  slides: z.array(slideSchema).optional(),
})

export const createAnnouncementFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(announcementSchema)
  .handler(async ({ data }) => {
    return createAnnouncement({
      ...data,
      id: data.id ?? crypto.randomUUID(),
      slides: data.slides as Array<Slide> | undefined,
    })
  })

export const updateAnnouncementFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      type: z.enum(['whats-new', 'bulletin']).optional(),
      isPublished: z.boolean().optional(),
      priority: z.number().int().optional(),
      slides: z.array(slideSchema).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    return updateAnnouncement(
      id,
      updateData as Parameters<typeof updateAnnouncement>[1],
    )
  })

export const deleteAnnouncementFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await deleteAnnouncement(data.id)
    return { success: true }
  })

export function useDismissAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: { announcementId: string }) => {
      return dismissAnnouncementFn({ data: variables })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] })
    },
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      title: string
      content: string
      type: 'whats-new' | 'bulletin'
      isPublished: boolean
      priority: number
      slides?: Array<Slide>
    }) => {
      return createAnnouncementFn({ data: variables })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'admin'] })
    },
  })
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      id: string
      title?: string
      content?: string
      type?: 'whats-new' | 'bulletin'
      isPublished?: boolean
      priority?: number
      slides?: Array<Slide>
    }) => {
      return updateAnnouncementFn({ data: variables })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'admin'] })
    },
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: { id: string }) => {
      return deleteAnnouncementFn({ data: variables })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'admin'] })
    },
  })
}
