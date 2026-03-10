import { sql } from 'drizzle-orm'
import { jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

export const siteConfig = pgTable(
  'site_config',
  {
    id: text().primaryKey().notNull(),
    watchProviders: jsonb(),
    watchWeekDay: text().notNull(),
  },
  () => [uniqueIndex('site_config_singleton').using('btree', sql`(TRUE)`)],
)
