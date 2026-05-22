import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import {
  getActiveAnnouncementsForUser,
  getAllAnnouncements,
} from '@/db/queries/announcements'
import { authMiddleware } from '@/middleware/auth'
import { adminMiddleware } from '@/middleware/admin'

export const getActiveAnnouncementsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.user) throw new Error('Unauthorized')
    return getActiveAnnouncementsForUser(context.user.userId)
  })

export const getAllAnnouncementsFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return getAllAnnouncements()
  })

export const announcementQueries = {
  active: () =>
    queryOptions({
      queryKey: ['announcements', 'active'],
      queryFn: () => getActiveAnnouncementsFn(),
    }),
  admin: () =>
    queryOptions({
      queryKey: ['announcements', 'admin'],
      queryFn: () => getAllAnnouncementsFn(),
    }),
}
