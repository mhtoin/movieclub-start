import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

import { LandingPage, LandingSkeleton } from '@/components/home/landing-page'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { homeQueries } from '@/lib/react-query/queries/home'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'

export const Route = createFileRoute('/_authenticated/home')({
  loader: async ({ context }) => {
    const userId = context.user.userId

    // Only block on the query needed for the above-the-fold hero.
    // Everything else can stream in via prefetchQuery.
    await context.queryClient.ensureQueryData(movieQueries.latest())

    if (userId) {
      await context.queryClient.ensureQueryData(shortlistQueries.byUser(userId))
    }

    // Fire-and-forget secondary data so the page can start rendering sooner.
    context.queryClient.prefetchQuery(shortlistQueries.all())
    context.queryClient.prefetchQuery(movieQueries.allWatched())
    if (userId) {
      context.queryClient.prefetchQuery(dashboardQueries.stats(userId))
      context.queryClient.prefetchQuery(homeQueries.seeds(userId))
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
