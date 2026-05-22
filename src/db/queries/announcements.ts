import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import { announcement, announcementDismissal } from '../schema/announcements'
import type { Slide } from '../schema/announcements'

export async function getPublishedAnnouncements() {
  try {
    return db
      .select()
      .from(announcement)
      .where(eq(announcement.isPublished, true))
      .orderBy(announcement.priority, announcement.createdAt)
  } catch (error) {
    console.error('Database error while fetching announcements:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function getActiveAnnouncementsForUser(userId: string) {
  try {
    const published = await getPublishedAnnouncements()
    if (published.length === 0) return published

    const announcementIds = published.map((a) => a.id)

    const dismissals = await db
      .select()
      .from(announcementDismissal)
      .where(
        and(
          eq(announcementDismissal.userId, userId),
          inArray(announcementDismissal.announcementId, announcementIds),
        ),
      )

    const dismissedIds = new Set(dismissals.map((d) => d.announcementId))
    return published.filter((a) => !dismissedIds.has(a.id))
  } catch (error) {
    console.error('Database error while fetching active announcements:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function dismissAnnouncement(
  userId: string,
  announcementId: string,
) {
  try {
    await db
      .insert(announcementDismissal)
      .values({
        userId,
        announcementId,
        dismissedAt: new Date(),
      })
      .onConflictDoNothing()
  } catch (error) {
    console.error('Database error while dismissing announcement:', error)
    throw new Error('Failed to dismiss announcement. Please try again.', {
      cause: error,
    })
  }
}

export async function getAllAnnouncements() {
  try {
    return db
      .select()
      .from(announcement)
      .orderBy(announcement.priority, announcement.createdAt)
  } catch (error) {
    console.error('Database error while fetching all announcements:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

export async function createAnnouncement(data: {
  id: string
  title: string
  content: string
  type: string
  isPublished: boolean
  priority: number
  slides?: Array<Slide>
}) {
  try {
    const result = await db
      .insert(announcement)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then((rows) => rows[0])
    return result
  } catch (error) {
    console.error('Database error while creating announcement:', error)
    throw new Error('Failed to create announcement. Please try again.', {
      cause: error,
    })
  }
}

export async function updateAnnouncement(
  id: string,
  data: {
    title?: string
    content?: string
    type?: string
    isPublished?: boolean
    priority?: number
    slides?: Array<Slide>
  },
) {
  try {
    const result = await db
      .update(announcement)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(announcement.id, id))
      .returning()
      .then((rows) => rows[0])
    return result
  } catch (error) {
    console.error('Database error while updating announcement:', error)
    throw new Error('Failed to update announcement. Please try again.', {
      cause: error,
    })
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await db
      .delete(announcementDismissal)
      .where(eq(announcementDismissal.announcementId, id))

    await db.delete(announcement).where(eq(announcement.id, id))
  } catch (error) {
    console.error('Database error while deleting announcement:', error)
    throw new Error('Failed to delete announcement. Please try again.', {
      cause: error,
    })
  }
}
