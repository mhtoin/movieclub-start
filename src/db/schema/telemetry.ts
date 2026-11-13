import { sql } from 'drizzle-orm'
import {
  bigserial,
  check,
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

/**
 * Privacy-safe Core Web Vitals samples.
 *
 * Deliberately contains no user/session ID, IP, user agent, viewport, referrer,
 * query string, full pathname, or web-vitals attribution entries. `id` is an
 * opaque row identifier with no link to a person.
 */
export const webVitalMetric = pgTable(
  'web_vital_metric',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    value: doublePrecision('value').notNull(),
    rating: text('rating').notNull(),
    routeKey: text('route_key').notNull(),
    navigationType: text('navigation_type').notNull(),
    bucketStart: timestamp('bucket_start', {
      withTimezone: true,
      precision: 0,
    }).notNull(),
  },
  (table) => [
    index('web_vital_metric_bucket_start_idx').on(table.bucketStart),
    check(
      'web_vital_metric_name_check',
      sql`${table.name} in ('CLS', 'FCP', 'INP', 'LCP', 'TTFB')`,
    ),
    check(
      'web_vital_metric_value_check',
      sql`${table.value} >= 0 and ${table.value} <= 600000`,
    ),
    check(
      'web_vital_metric_rating_check',
      sql`${table.rating} in ('good', 'needs-improvement', 'poor')`,
    ),
    check(
      'web_vital_metric_route_key_check',
      sql`${table.routeKey} in ('landing', 'home', 'discover', 'shortlists', 'raffle', 'dashboard', 'settings', 'admin', 'tierlist', 'watched', 'reset-password', 'auth', 'other')`,
    ),
    check(
      'web_vital_metric_navigation_type_check',
      sql`${table.navigationType} in ('navigate', 'reload', 'back-forward', 'back-forward-cache', 'prerender', 'restore')`,
    ),
  ],
)

export type WebVitalMetric = typeof webVitalMetric.$inferSelect
export type InsertWebVitalMetric = typeof webVitalMetric.$inferInsert
