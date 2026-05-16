type CacheEntry<T> = {
  data: T
  expiresAt: number
}

const MAX_CACHE_ENTRIES = 500

const cache = new Map<string, CacheEntry<unknown>>()

/**
 * Evict oldest entries when the cache grows beyond its size limit.
 * TTL-based expiry is also checked on every read.
 */
function pruneIfNeeded() {
  if (cache.size <= MAX_CACHE_ENTRIES) return

  const now = Date.now()
  const entries = Array.from(cache.entries())

  // Sort by expiration time (oldest first) and prune expired + excess
  entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt)

  const targetSize = Math.floor(MAX_CACHE_ENTRIES * 0.75)
  let removed = 0

  for (const [key, entry] of entries) {
    if (entry.expiresAt <= now || cache.size - removed > targetSize) {
      cache.delete(key)
      removed++
    }
  }
}

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return entry.data
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  pruneIfNeeded()
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  })
}
