import { z } from 'zod'

/**
 * Allowlisted document-level metrics. Only these names can be persisted; the
 * reporter never sends attribution entries, IDs, or URLs.
 */
export const WEB_VITAL_NAMES = ['CLS', 'FCP', 'INP', 'LCP', 'TTFB'] as const
export type WebVitalName = (typeof WEB_VITAL_NAMES)[number]

/** web-vitals navigation types (the browser Navigation Timing values plus BFCache states). */
export const NAVIGATION_TYPES = [
  'navigate',
  'reload',
  'back-forward',
  'back-forward-cache',
  'prerender',
  'restore',
] as const
export type NavigationType = (typeof NAVIGATION_TYPES)[number]

/**
 * Coarse, allowlisted route buckets. Dynamic IDs and full pathnames never reach
 * the database.
 */
export const ROUTE_KEYS = [
  'landing',
  'home',
  'discover',
  'shortlists',
  'raffle',
  'dashboard',
  'settings',
  'admin',
  'tierlist',
  'watched',
  'reset-password',
  'auth',
  'other',
] as const
export type RouteKey = (typeof ROUTE_KEYS)[number]

export const RATINGS = ['good', 'needs-improvement', 'poor'] as const
export type WebVitalRating = (typeof RATINGS)[number]

export const MAX_BATCH_SIZE = 5

const METRIC_RANGES: Record<WebVitalName, { min: number; max: number }> = {
  // CLS is unitless; timings are milliseconds.
  CLS: { min: 0, max: 100 },
  FCP: { min: 0, max: 600_000 },
  INP: { min: 0, max: 600_000 },
  LCP: { min: 0, max: 600_000 },
  TTFB: { min: 0, max: 600_000 },
}

/** Official web-vitals thresholds: <= good is "good", <= poor is "needs-improvement". */
const RATING_THRESHOLDS: Record<WebVitalName, readonly [number, number]> = {
  CLS: [0.1, 0.25],
  FCP: [1_800, 3_000],
  INP: [200, 500],
  LCP: [2_500, 4_000],
  TTFB: [800, 1_800],
}

const navigationTypeSchema = z.enum(NAVIGATION_TYPES)
const routeKeySchema = z.enum(ROUTE_KEYS)

function sampleSchema<TName extends WebVitalName>(name: TName) {
  const range = METRIC_RANGES[name]
  return z
    .object({
      name: z.literal(name),
      value: z.number().min(range.min).max(range.max),
      routeKey: routeKeySchema,
      navigationType: navigationTypeSchema,
    })
    .strict()
}

/**
 * Strict per-metric allowlist and range validation. Unknown names, extra
 * properties, non-finite values, and out-of-range values are rejected.
 */
export const webVitalSampleSchema = z.discriminatedUnion('name', [
  sampleSchema('CLS'),
  sampleSchema('FCP'),
  sampleSchema('INP'),
  sampleSchema('LCP'),
  sampleSchema('TTFB'),
])

export const webVitalsPayloadSchema = z
  .object({
    samples: z.array(webVitalSampleSchema).min(1).max(MAX_BATCH_SIZE),
  })
  .strict()

export type WebVitalSample = z.infer<typeof webVitalSampleSchema>

export type WebVitalRow = WebVitalSample & {
  rating: WebVitalRating
  bucketStart: Date
}

export function isNavigationType(value: unknown): value is NavigationType {
  return (
    typeof value === 'string' &&
    (NAVIGATION_TYPES as ReadonlyArray<string>).includes(value)
  )
}

/**
 * Maps a pathname to a coarse route bucket. Only the first path segment is
 * inspected, so dynamic IDs and nested paths cannot leak into storage.
 */
export function toRouteKey(pathname: string): RouteKey {
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) return 'other'

  const path = pathname.split('?', 1)[0]?.split('#', 1)[0] ?? ''
  const segment = path.split('/').filter(Boolean)[0]?.toLowerCase()

  if (!segment) return 'landing'

  switch (segment) {
    case 'home':
      return 'home'
    case 'discover':
      return 'discover'
    case 'shortlist':
    case 'shortlists':
      return 'shortlists'
    case 'raffle':
      return 'raffle'
    case 'dashboard':
      return 'dashboard'
    case 'settings':
      return 'settings'
    case 'admin':
      return 'admin'
    case 'tierlist':
    case 'tierlists':
      return 'tierlist'
    case 'watched':
      return 'watched'
    case 'reset-password':
      return 'reset-password'
    case 'login':
      return 'auth'
    default:
      return 'other'
  }
}

export function rateWebVital(
  name: WebVitalName,
  value: number,
): WebVitalRating {
  const [goodThreshold, poorThreshold] = RATING_THRESHOLDS[name]

  if (value <= goodThreshold) return 'good'
  if (value <= poorThreshold) return 'needs-improvement'
  return 'poor'
}

export const HOUR_MS = 60 * 60 * 1_000

/** Truncates an instant to the start of its UTC hour. */
export function getHourBucket(date: Date): Date {
  return new Date(Math.floor(date.getTime() / HOUR_MS) * HOUR_MS)
}

/**
 * Converts validated samples into storage rows. Rating and the hour bucket are
 * derived on the server; a batch keeps only the latest value per metric.
 */
export function toWebVitalRows(
  samples: ReadonlyArray<WebVitalSample>,
  now: Date,
): Array<WebVitalRow> {
  const bucketStart = getHourBucket(now)
  const latestByName = new Map<WebVitalName, WebVitalSample>()

  for (const sample of samples) {
    latestByName.set(sample.name, sample)
  }

  return Array.from(latestByName.values(), (sample) => ({
    ...sample,
    rating: rateWebVital(sample.name, sample.value),
    bucketStart,
  }))
}
