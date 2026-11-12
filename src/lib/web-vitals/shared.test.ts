import { describe, expect, it } from 'vitest'
import {
  getHourBucket,
  rateWebVital,
  toRouteKey,
  toWebVitalRows,
  webVitalSampleSchema,
  webVitalsPayloadSchema,
} from './shared'
import type { WebVitalName } from './shared'

function sample(
  name: WebVitalName,
  value: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    name,
    value,
    routeKey: 'home',
    navigationType: 'navigate',
    ...overrides,
  }
}

describe('toRouteKey', () => {
  it.each([
    ['/', 'landing'],
    ['/home', 'home'],
    ['/discover', 'discover'],
    ['/discover?genre=horror', 'discover'],
    ['/shortlists', 'shortlists'],
    ['/shortlist', 'shortlists'],
    ['/raffle', 'raffle'],
    ['/dashboard', 'dashboard'],
    ['/settings', 'settings'],
    ['/admin', 'admin'],
    ['/tierlist', 'tierlist'],
    ['/tierlists', 'tierlist'],
    ['/tierlist/user-123/tier-9', 'tierlist'],
    ['/watched', 'watched'],
    ['/watched/42', 'watched'],
    ['/reset-password', 'reset-password'],
    ['/login/google/callback', 'auth'],
    ['/unknown/secret-id', 'other'],
    ['//unknown', 'other'],
    ['relative/path', 'other'],
    ['', 'other'],
  ])('maps %s to %s', (pathname, expected) => {
    expect(toRouteKey(pathname)).toBe(expected)
  })
})

describe('rateWebVital', () => {
  it.each([
    ['CLS', 0.1, 'good'],
    ['CLS', 0.100001, 'needs-improvement'],
    ['CLS', 0.25, 'needs-improvement'],
    ['CLS', 0.250001, 'poor'],
    ['FCP', 1_800, 'good'],
    ['FCP', 1_800.1, 'needs-improvement'],
    ['FCP', 3_000, 'needs-improvement'],
    ['FCP', 3_000.1, 'poor'],
    ['INP', 200, 'good'],
    ['INP', 200.1, 'needs-improvement'],
    ['INP', 500, 'needs-improvement'],
    ['INP', 500.1, 'poor'],
    ['LCP', 2_500, 'good'],
    ['LCP', 2_500.1, 'needs-improvement'],
    ['LCP', 4_000, 'needs-improvement'],
    ['LCP', 4_000.1, 'poor'],
    ['TTFB', 800, 'good'],
    ['TTFB', 800.1, 'needs-improvement'],
    ['TTFB', 1_800, 'needs-improvement'],
    ['TTFB', 1_800.1, 'poor'],
  ] as const)('rates %s=%d as %s', (name, value, expected) => {
    expect(rateWebVital(name, value)).toBe(expected)
  })
})

describe('getHourBucket', () => {
  it('truncates to the start of the UTC hour', () => {
    expect(getHourBucket(new Date('2026-11-12T18:37:45.123Z'))).toEqual(
      new Date('2026-11-12T18:00:00.000Z'),
    )
  })
})

describe('toWebVitalRows', () => {
  it('derives rating and the shared hour bucket on the server', () => {
    const now = new Date('2026-11-12T18:37:45.123Z')
    const rows = toWebVitalRows(
      [
        {
          name: 'LCP',
          value: 5_000,
          routeKey: 'watched',
          navigationType: 'reload',
        },
        {
          name: 'CLS',
          value: 0.05,
          routeKey: 'watched',
          navigationType: 'reload',
        },
      ],
      now,
    )

    expect(rows).toEqual([
      {
        name: 'LCP',
        value: 5_000,
        routeKey: 'watched',
        navigationType: 'reload',
        rating: 'poor',
        bucketStart: new Date('2026-11-12T18:00:00.000Z'),
      },
      {
        name: 'CLS',
        value: 0.05,
        routeKey: 'watched',
        navigationType: 'reload',
        rating: 'good',
        bucketStart: new Date('2026-11-12T18:00:00.000Z'),
      },
    ])
  })

  it('keeps only the latest value per metric in a batch', () => {
    const rows = toWebVitalRows(
      [
        {
          name: 'LCP',
          value: 1_000,
          routeKey: 'home',
          navigationType: 'navigate',
        },
        {
          name: 'LCP',
          value: 2_000,
          routeKey: 'home',
          navigationType: 'navigate',
        },
      ],
      new Date('2026-11-12T18:00:00.000Z'),
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]?.value).toBe(2_000)
  })
})

describe('webVitalsPayloadSchema', () => {
  it('accepts a valid batch', () => {
    expect(
      webVitalsPayloadSchema.safeParse({
        samples: [
          sample('LCP', 2_000),
          sample('CLS', 0.05),
          sample('INP', 150),
          sample('FCP', 1_000),
          sample('TTFB', 500),
        ],
      }).success,
    ).toBe(true)
  })

  it('rejects unknown metric names', () => {
    expect(
      webVitalSampleSchema.safeParse(sample('FID' as WebVitalName, 100))
        .success,
    ).toBe(false)
  })

  it.each([
    ['CLS', -0.01],
    ['CLS', 101],
    ['FCP', 600_001],
    ['INP', 600_001],
    ['LCP', 600_001],
    ['TTFB', 600_001],
    ['LCP', Number.POSITIVE_INFINITY],
    ['LCP', Number.NaN],
  ])('rejects out-of-range %s value %s', (name, value) => {
    expect(
      webVitalSampleSchema.safeParse(sample(name as WebVitalName, value))
        .success,
    ).toBe(false)
  })

  it('rejects unknown route keys', () => {
    expect(
      webVitalSampleSchema.safeParse(
        sample('LCP', 2_000, { routeKey: 'movie/123' }),
      ).success,
    ).toBe(false)
  })

  it('rejects unknown navigation types', () => {
    expect(
      webVitalSampleSchema.safeParse(
        sample('LCP', 2_000, { navigationType: 'cross-site' }),
      ).success,
    ).toBe(false)
  })

  it('rejects extra properties', () => {
    expect(
      webVitalSampleSchema.safeParse(
        sample('LCP', 2_000, { pathname: '/watched/42' }),
      ).success,
    ).toBe(false)
  })

  it('rejects client-supplied rating and bucket timestamps', () => {
    expect(
      webVitalSampleSchema.safeParse(sample('LCP', 2_000, { rating: 'good' }))
        .success,
    ).toBe(false)
    expect(
      webVitalSampleSchema.safeParse(
        sample('LCP', 2_000, { bucketStart: new Date() }),
      ).success,
    ).toBe(false)
  })

  it('rejects empty and oversized batches', () => {
    expect(webVitalsPayloadSchema.safeParse({ samples: [] }).success).toBe(
      false,
    )
    expect(
      webVitalsPayloadSchema.safeParse({
        samples: Array.from({ length: 6 }, () => sample('LCP', 2_000)),
      }).success,
    ).toBe(false)
  })

  it('rejects extra top-level properties', () => {
    expect(
      webVitalsPayloadSchema.safeParse({
        samples: [sample('LCP', 2_000)],
        userId: 'secret',
      }).success,
    ).toBe(false)
  })
})
