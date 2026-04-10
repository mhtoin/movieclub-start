import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: ONE_WEEK,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export const persister =
  typeof window !== 'undefined'
    ? createAsyncStoragePersister({
        storage: window.localStorage,
        throttleTime: 1000,
      })
    : null
