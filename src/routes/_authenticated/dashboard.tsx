import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { DashboardSkeletonFull } from '@/components/dashboard/dashboard-skeleton'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: async ({ context }) => {
    const userId = context.user?.userId
    if (userId) {
      await Promise.all([
        context.queryClient.ensureQueryData(dashboardQueries.stats(userId)),
        context.queryClient.ensureQueryData(dashboardQueries.insights()),
        context.queryClient.ensureQueryData(dashboardQueries.insights(userId)),
        context.queryClient.ensureQueryData(dashboardQueries.nextMovie()),
      ])
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
