import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { DashboardSkeletonFull } from '@/components/dashboard/dashboard-skeleton'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: ({ context }) => {
    const userId = context.user?.userId
    if (userId) {
      context.queryClient.prefetchQuery(dashboardQueries.stats(userId))
      context.queryClient.prefetchQuery(dashboardQueries.insights())
      context.queryClient.prefetchQuery(dashboardQueries.insights(userId))
      context.queryClient.prefetchQuery(dashboardQueries.nextMovie())
    }
  },
  component: Dashboard,
})

function Dashboard() {
  const { user } = Route.useRouteContext()

  return (
    <Suspense fallback={<DashboardSkeletonFull />}>
      <DashboardContent user={user} />
    </Suspense>
  )
}
