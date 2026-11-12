import { useEffect } from 'react'
import type { NavigationType, WebVitalName } from '@/lib/web-vitals/shared'
import {
  MAX_BATCH_SIZE,
  isNavigationType,
  toRouteKey,
} from '@/lib/web-vitals/shared'

const FLUSH_DELAY_MS = 30_000

type PendingMetric = {
  value: number
  navigationType: NavigationType
}

function telemetryAllowed(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  const win = window as Window & {
    doNotTrack?: string
    globalPrivacyControl?: boolean
  }

  return !(
    nav.doNotTrack === '1' ||
    nav.doNotTrack === 'yes' ||
    win.doNotTrack === '1' ||
    win.doNotTrack === 'yes' ||
    nav.globalPrivacyControl === true ||
    win.globalPrivacyControl === true
  )
}

/**
 * Production-only, privacy-safe Core Web Vitals reporter.
 *
 * The route bucket is captured once from the initial document pathname, so SPA
 * navigations cannot change (or leak) the key. Only metric name, value, the
 * metric's navigation type, and that coarse key are sent. Failures are
 * intentionally ignored so telemetry can never affect the page.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    if (!import.meta.env.PROD || !telemetryAllowed()) return

    const routeKey = toRouteKey(window.location.pathname)
    const pending = new Map<WebVitalName, PendingMetric>()
    let disposed = false
    let flushTimer: ReturnType<typeof setTimeout> | null = null

    const clearFlushTimer = () => {
      if (flushTimer !== null) {
        clearTimeout(flushTimer)
        flushTimer = null
      }
    }

    const flush = () => {
      clearFlushTimer()
      if (disposed || pending.size === 0) return

      const samples = Array.from(pending, ([name, metric]) => ({
        name,
        value: metric.value,
        routeKey,
        navigationType: metric.navigationType,
      })).slice(0, MAX_BATCH_SIZE)

      pending.clear()
      if (samples.length === 0) return

      try {
        void fetch('/api/web-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ samples }),
          keepalive: true,
          credentials: 'omit',
          mode: 'same-origin',
        }).catch(() => {
          // Best effort: telemetry must never affect the page.
        })
      } catch {
        // Best effort: telemetry must never affect the page.
      }
    }

    const scheduleFlush = () => {
      if (disposed || flushTimer !== null) return
      flushTimer = setTimeout(flush, FLUSH_DELAY_MS)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush()
    }

    const handlePageHide = () => flush()

    const record = (
      name: WebVitalName,
      value: number,
      navigationType: unknown,
    ) => {
      if (disposed || !Number.isFinite(value) || value < 0) return

      pending.set(name, {
        value,
        navigationType: isNavigationType(navigationType)
          ? navigationType
          : 'navigate',
      })
      scheduleFlush()
    }

    void import('web-vitals')
      .then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
        if (disposed) return

        // Register web-vitals' own hidden-state callbacks before our flush
        // listeners so final LCP/CLS/INP values are already in `pending`.
        onCLS((metric) => record('CLS', metric.value, metric.navigationType))
        onFCP((metric) => record('FCP', metric.value, metric.navigationType))
        onINP((metric) => record('INP', metric.value, metric.navigationType))
        onLCP((metric) => record('LCP', metric.value, metric.navigationType))
        onTTFB((metric) => record('TTFB', metric.value, metric.navigationType))

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('pagehide', handlePageHide)

        if (document.visibilityState === 'hidden') {
          setTimeout(flush, 0)
        }
      })
      .catch(() => {
        // Best effort: a failed dynamic import is not a page error.
      })

    return () => {
      disposed = true
      clearFlushTimer()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [])

  return null
}
