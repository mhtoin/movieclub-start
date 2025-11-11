import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { movie } from './movies'
import { user } from './users'

export const shortlist = pgTable(
  'shortlist',
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    isReady: boolean().default(false).notNull(),
    requiresSelection: boolean().default(false),
    selectedIndex: integer(),
    participating: boolean().default(true).notNull(),
  },
  (table) => [
    uniqueIndex('Shortlist_userId_key').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'Shortlist_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export type Shortlist = typeof shortlist.$inferSelect
export type NewShortlist = typeof shortlist.$inferInsert
export type ShortlistWithUserMovies = Shortlist & {
  user: typeof user.$inferSelect
  movies: (typeof movie.$inferSelect)[]
}
