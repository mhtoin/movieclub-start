export const TELEMETRY_RATE_LIMIT = 600
export const TELEMETRY_RATE_WINDOW_MS = 60_000
export const TELEMETRY_DAILY_SAMPLE_LIMIT = 10_000

export type RateLimiter = {
  /** Records one request; returns false once the window is exhausted. */
  tryConsume: (now?: number) => boolean
  /** Number of requests still allowed in the active window. */
  remaining: (now?: number) => number
  /** For tests and process-local resets. */
  reset: () => void
}

/**
 * Fixed-window limiter. The caller is responsible for making it global: a
 * single module-scoped instance is shared by every request in the process, so
 * there is no per-IP (or any other client-derived) key.
 */
export function createRateLimiter(
  limit = TELEMETRY_RATE_LIMIT,
  windowMs = TELEMETRY_RATE_WINDOW_MS,
): RateLimiter {
  let windowStart = 0
  let used = 0

  const rollIfNeeded = (now: number) => {
    if (now < windowStart || now - windowStart >= windowMs) {
      windowStart = now
      used = 0
    }
  }

  return {
    tryConsume(now = Date.now()) {
      rollIfNeeded(now)
      if (used >= limit) return false
      used += 1
      return true
    },
    remaining(now = Date.now()) {
      rollIfNeeded(now)
      return Math.max(0, limit - used)
    },
    reset() {
      windowStart = 0
      used = 0
    },
  }
}

/** Process-wide telemetry budget (not keyed by IP, user, or session). */
export const telemetryRateLimiter = createRateLimiter()

export type DailySampleBudget = {
  /** Records a batch; returns false if it would exceed the UTC-day budget. */
  tryConsume: (samples: number, now?: number) => boolean
  reset: () => void
}

/**
 * Bounds persistent growth if the public endpoint receives sustained noise.
 * This remains process-local, like the request limiter, and stores no identity.
 */
export function createDailySampleBudget(
  limit = TELEMETRY_DAILY_SAMPLE_LIMIT,
): DailySampleBudget {
  let utcDay = -1
  let used = 0

  return {
    tryConsume(samples, now = Date.now()) {
      if (!Number.isInteger(samples) || samples < 0 || samples > limit) {
        return false
      }

      const nextDay = Math.floor(now / (24 * 60 * 60 * 1_000))
      if (nextDay !== utcDay) {
        utcDay = nextDay
        used = 0
      }

      if (used + samples > limit) return false
      used += samples
      return true
    },
    reset() {
      utcDay = -1
      used = 0
    },
  }
}

export const telemetryDailySampleBudget = createDailySampleBudget()
