import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { user } from './users'

export const announcement = pgTable('announcement', {
  id: text().primaryKey().notNull(),
  title: text().notNull(),
  content: text().notNull(),
  type: text().notNull(), // 'whats-new' | 'bulletin'
  isPublished: boolean().default(false).notNull(),
  priority: integer().default(0).notNull(),
  slides: jsonb().$type<Array<Slide>>(),
  createdAt: timestamp({ precision: 3, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp({ precision: 3, mode: 'date' }).notNull().defaultNow(),
})

export const announcementDismissal = pgTable(
  'announcement_dismissal',
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    announcementId: text()
      .notNull()
      .references(() => announcement.id, { onDelete: 'cascade' }),
    dismissedAt: timestamp({ precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.announcementId] })],
)

export type Slide = {
  title: string
  description: string
}

export type Announcement = typeof announcement.$inferSelect
export type InsertAnnouncement = typeof announcement.$inferInsert
export type AnnouncementDismissal = typeof announcementDismissal.$inferSelect
export type InsertAnnouncementDismissal =
  typeof announcementDismissal.$inferInsert
