import { describe, expect, it } from 'vitest'
import {
  TELEMETRY_DAILY_SAMPLE_LIMIT,
  TELEMETRY_RATE_LIMIT,
  createDailySampleBudget,
  createRateLimiter,
  telemetryDailySampleBudget,
  telemetryRateLimiter,
} from './rate-limit'

describe('createRateLimiter', () => {
  it('allows exactly the configured budget per window', () => {
    const limiter = createRateLimiter(3, 1_000)

    expect(limiter.tryConsume(0)).toBe(true)
    expect(limiter.tryConsume(0)).toBe(true)
    expect(limiter.tryConsume(0)).toBe(true)
    expect(limiter.tryConsume(0)).toBe(false)
    expect(limiter.remaining(0)).toBe(0)
  })

  it('rolls over after the window', () => {
    const limiter = createRateLimiter(1, 1_000)

    expect(limiter.tryConsume(500)).toBe(true)
    expect(limiter.tryConsume(999)).toBe(false)
    expect(limiter.tryConsume(1_500)).toBe(true)
  })

  it('recovers when the clock moves backwards', () => {
    const limiter = createRateLimiter(1, 1_000)

    expect(limiter.tryConsume(5_000)).toBe(true)
    expect(limiter.tryConsume(5_001)).toBe(false)
    expect(limiter.tryConsume(4_000)).toBe(true)
  })

  it('reports remaining budget without consuming it', () => {
    const limiter = createRateLimiter(10, 1_000)

    expect(limiter.remaining(0)).toBe(10)
    limiter.tryConsume(0)
    expect(limiter.remaining(0)).toBe(9)
    expect(limiter.remaining(0)).toBe(9)
  })

  it('resets explicitly', () => {
    const limiter = createRateLimiter(1, 1_000)

    limiter.tryConsume(0)
    expect(limiter.tryConsume(0)).toBe(false)
    limiter.reset()
    expect(limiter.tryConsume(0)).toBe(true)
  })

  it('ships a 600/min process-wide default', () => {
    expect(TELEMETRY_RATE_LIMIT).toBe(600)

    telemetryRateLimiter.reset()
    for (let i = 0; i < TELEMETRY_RATE_LIMIT; i += 1) {
      expect(telemetryRateLimiter.tryConsume(0)).toBe(true)
    }
    expect(telemetryRateLimiter.tryConsume(0)).toBe(false)
    telemetryRateLimiter.reset()
  })
})

describe('createDailySampleBudget', () => {
  it('bounds persisted samples per UTC day', () => {
    const budget = createDailySampleBudget(5)
    const day = Date.UTC(2026, 10, 12)

    expect(budget.tryConsume(3, day)).toBe(true)
    expect(budget.tryConsume(2, day + 1_000)).toBe(true)
    expect(budget.tryConsume(1, day + 2_000)).toBe(false)
  })

  it('resets at the next UTC day and rejects invalid counts', () => {
    const budget = createDailySampleBudget(2)
    const day = Date.UTC(2026, 10, 12)

    expect(budget.tryConsume(2, day)).toBe(true)
    expect(budget.tryConsume(1, day + 24 * 60 * 60 * 1_000)).toBe(true)
    expect(budget.tryConsume(-1, day + 24 * 60 * 60 * 1_000)).toBe(false)
    expect(budget.tryConsume(3, day + 24 * 60 * 60 * 1_000)).toBe(false)
  })

  it('configures a modest process-wide daily ceiling', () => {
    expect(TELEMETRY_DAILY_SAMPLE_LIMIT).toBe(10_000)
    telemetryDailySampleBudget.reset()
  })
})
