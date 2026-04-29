import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7

function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const err = error as { message?: string; status?: number }
  if (!navigator.onLine) return true
  if (err.status === 401 || err.status === 403 || err.status === 404)
    return false
  if (
    err.message?.includes('Failed to fetch') ||
    err.message?.includes('NetworkError')
  )
    return true
  return false
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: ONE_WEEK,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (!isNetworkError(error)) return false
          return failureCount < 2
        },
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  })
}

export const persister =
  typeof window !== 'undefined'
    ? createAsyncStoragePersister({
        storage: window.localStorage,
        throttleTime: 1000,
      })
    : null
