import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

/**
 * Maps each Postgres table name (from the notify trigger payload) to the
 * React Query keys that should be invalidated when that table changes.
 */
const TABLE_TO_QUERY_KEYS: Record<string, ReadonlyArray<readonly string[]>> = {
  movie: [['movies'], ['dashboard']],
  shortlist: [['shortlists'], ['raffle', 'participating']],
  _movie_to_shortlist: [['shortlists'], ['raffle', 'participating']],
  tierlist: [['tierlists']],
  tier: [['tierlists']],
  movies_on_tiers: [['tierlists'], ['dashboard']],
  raffle: [['raffle'], ['dashboard']],
  _raffle_to_user: [['raffle']],
}

/**
 * Opens a single SSE connection to /api/sse for the lifetime of the
 * authenticated layout. On every NOTIFY from Postgres parse the
 * `{ table, op }` payload and invalidate the matching React Query keys
 * so all subscribed components refetch automatically.
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
          queryClient.invalidateQueries({ queryKey: queryKey as string[] })
        }
      } catch {}
    }

    es.onerror = () => {}

    return () => {
      es.close()
    }
  }, [queryClient])
}
