type CacheEntry<T> = {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

export function getCached<T>(
  key: string,
): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return entry.data
}

export function setCache<T>(
  key: string,
  data: T,
  ttlMs: number,
): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  })
}
