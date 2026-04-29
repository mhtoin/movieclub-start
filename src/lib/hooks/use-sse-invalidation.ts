import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

/**
 * Maps each Postgres table name to the React Query key prefixes that should
 * be invalidated when that table changes. Keys are prefix-matched so
 * `['movies', 'watched']` also invalidates `['movies', 'watched', '2025-01']`.
 */
const TABLE_TO_QUERY_KEYS: Record<string, ReadonlyArray<readonly string[]>> = {
  movie: [
    ['movies', 'latest'],
    ['movies', 'watched'],
    ['movies', 'months'],
    ['movies', 'allWatched'],
    ['dashboard'],
  ],
  shortlist: [
    ['shortlist'],
    ['shortlists', 'all'],
    ['raffle', 'participating'],
  ],
  _movie_to_shortlist: [
    ['shortlist'],
    ['shortlists', 'all'],
  ],
  tierlist: [
    ['tierlists', 'index'],
    ['tierlists', 'user'],
    ['tierlists', 'single'],
    ['tierlists', 'userSummary'],
  ],
  tier: [
    ['tierlists', 'single'],
    ['tierlists', 'user'],
  ],
  movies_on_tiers: [
    ['tierlists', 'single'],
    ['tierlists', 'user'],
    ['dashboard'],
  ],
  raffle: [
    ['raffle', 'history'],
    ['raffle', 'stats'],
    ['dashboard'],
  ],
  _raffle_to_user: [
    ['raffle', 'history'],
    ['raffle', 'stats'],
  ],
}

/**
 * Opens a single SSE connection to /api/sse for the lifetime of the
 * authenticated layout. On every NOTIFY from Postgres parse the
 * `{ table, op }` payload and invalidate the matching React Query keys
 * so all subscribed components refetch automatically.
 *
 * Uses `refetchActive: true` so only queries currently rendered on screen
 * are refetched – queries for routes the user isn't viewing are skipped.
 */
export function useSSEInvalidation() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const es = new EventSource('/api/sse')

    es.onmessage = (event: MessageEvent<string>) => {
      try {
        const { table } = JSON.parse(event.data) as {
          table: string
          op: string
        }
        const keys = TABLE_TO_QUERY_KEYS[table]
        if (!keys) return
        for (const queryKey of keys) {
          queryClient.invalidateQueries({
            queryKey: queryKey as string[],
            refetchType: 'active',
          })
        }
      } catch {}
    }

    es.onerror = () => {}

    return () => {
      es.close()
    }
  }, [queryClient])
}
