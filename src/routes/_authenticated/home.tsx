import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

import { LandingPage, LandingSkeleton } from '@/components/home/landing-page'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'

export const Route = createFileRoute('/_authenticated/home')({
  loader: async ({ context }) => {
    const userId = context.user.userId

    const baseQueries = [
      context.queryClient.ensureQueryData(movieQueries.latest()),
      context.queryClient.ensureQueryData(shortlistQueries.all()),
      context.queryClient.ensureQueryData(movieQueries.allWatched()),
    ]

    await Promise.all(baseQueries)

    if (userId) {
      await Promise.all([
        context.queryClient.ensureQueryData(shortlistQueries.byUser(userId)),
        context.queryClient.ensureQueryData(dashboardQueries.stats(userId)),
      ])
    }
  },
  component: Home,
})

function Home() {
  const { user } = Route.useRouteContext()

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Suspense fallback={<LandingSkeleton />}>
        <LandingPage userId={user.userId || ''} />
      </Suspense>
    </div>
  )
}
