import { createFileRoute } from '@tanstack/react-router'
import { lt } from 'drizzle-orm'
import { db } from '@/db/db'
import { webVitalMetric } from '@/db/schema/telemetry'
import { logServerError } from '@/lib/server/logger'
import {
  MAX_TELEMETRY_BODY_BYTES,
  TelemetryHttpError,
  isSameOriginRequest,
  readLimitedJson,
} from '@/lib/web-vitals/http'
import {
  telemetryDailySampleBudget,
  telemetryRateLimiter,
} from '@/lib/web-vitals/rate-limit'
import { toWebVitalRows, webVitalsPayloadSchema } from '@/lib/web-vitals/shared'

const RETENTION_MS = 30 * 24 * 60 * 60 * 1_000
const PRUNE_INTERVAL_MS = 60 * 60 * 1_000

let insertFailureLogged = false
let pruneFailureLogged = false
let nextPruneAt = 0

function logOnce(kind: 'insert' | 'prune', error: unknown): void {
  if (kind === 'insert') {
    if (insertFailureLogged) return
    insertFailureLogged = true
  } else {
    if (pruneFailureLogged) return
    pruneFailureLogged = true
  }

  logServerError(`web_vitals.${kind}_failed`, error, {
    method: 'POST',
    path: '/api/web-vitals',
  })
}

/**
 * Opportunistic retention: at most one DELETE per process per hour, and only
 * on the request path. Failures are swallowed so pruning can never affect the
 * response.
 */
function maybePrune(now: number): void {
  if (now < nextPruneAt) return
  nextPruneAt = now + PRUNE_INTERVAL_MS

  void db
    .delete(webVitalMetric)
    .where(lt(webVitalMetric.bucketStart, new Date(now - RETENTION_MS)))
    .catch((error) => logOnce('prune', error))
}

function noStore(status: number, headers: Record<string, string> = {}) {
  return new Response(null, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers },
  })
}

function errorResponse(status: number, code: string) {
  return Response.json(
    { error: code },
    { status, headers: { 'Cache-Control': 'no-store' } },
  )
}

export const Route = createFileRoute('/api/web-vitals')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOriginRequest(request)) {
          return errorResponse(403, 'forbidden')
        }

        const now = Date.now()
        if (!telemetryRateLimiter.tryConsume(now)) {
          return errorResponse(429, 'rate_limited')
        }

        let payload: unknown
        try {
          payload = await readLimitedJson(request, MAX_TELEMETRY_BODY_BYTES)
        } catch (error) {
          if (error instanceof TelemetryHttpError) {
            return errorResponse(error.status, error.message)
          }
          return errorResponse(400, 'invalid_request')
        }

        const parsed = webVitalsPayloadSchema.safeParse(payload)
        if (!parsed.success) {
          return errorResponse(400, 'invalid_payload')
        }

        const rows = toWebVitalRows(parsed.data.samples, new Date(now))
        if (!telemetryDailySampleBudget.tryConsume(rows.length, now)) {
          // A valid but over-budget sample is silently discarded; telemetry is
          // best effort and should not generate retry traffic.
          return noStore(204)
        }

        try {
          if (rows.length > 0) {
            await db.insert(webVitalMetric).values(rows)
          }
          maybePrune(now)
        } catch (error) {
          // Drop the sample. This also covers the restart-before-migrate window
          // where the table does not exist yet.
          logOnce('insert', error)
        }

        return noStore(204)
      },
      GET: () => noStore(405, { Allow: 'POST' }),
    },
  },
})
