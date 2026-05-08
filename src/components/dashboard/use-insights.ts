import { useSuspenseQuery } from '@tanstack/react-query'
import type { FilterScope } from '@/components/dashboard/scope-toggle'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'

export function useInsights(userId: string, scope: FilterScope) {
  const { data: globalInsights } = useSuspenseQuery(dashboardQueries.insights())
  const { data: userInsights } = useSuspenseQuery(
    dashboardQueries.insights(userId),
  )
  return scope === 'mine' ? userInsights : globalInsights
}
