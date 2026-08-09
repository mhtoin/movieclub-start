import { sql } from 'drizzle-orm'
import { boolean, jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | Array<JsonValue>
  | { [key: string]: JsonValue }

export const siteConfig = pgTable(
  'site_config',
  {
    id: text().primaryKey().notNull(),
    watchProviders: jsonb('watchProviders').$type<{
      [key: string]: JsonValue
    } | null>(),
    watchWeekDay: text().notNull(),
    requireWinnerSelection: boolean().default(true).notNull(),
  },
  () => [uniqueIndex('site_config_singleton').using('btree', sql`(TRUE)`)],
)

export type SiteConfig = typeof siteConfig.$inferSelect
