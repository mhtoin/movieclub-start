import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { NextMovieCard } from '@/components/dashboard/next-movie-card'
import { StatCard } from '@/components/dashboard/stat-card'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  Clock,
  Film,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: async ({ context }) => {
    const userId = context.user?.userId
    if (userId) {
      await Promise.all([
        context.queryClient.ensureQueryData(dashboardQueries.stats(userId)),
        context.queryClient.ensureQueryData(dashboardQueries.nextMovie()),
      ])
    }
  },
  component: Dashboard,
})

function DashboardContent() {
  const { user } = Route.useRouteContext()
  const { data: stats } = useSuspenseQuery(
    dashboardQueries.stats(user?.userId || ''),
  )
  const { data: nextMovie } = useSuspenseQuery(dashboardQueries.nextMovie())

  const totalHours = Math.floor(stats.totalWatchTime / 60)
  const totalDays = Math.floor(totalHours / 24)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your movie watching journey
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Movies Watched"
          value={stats.totalWatchedMovies}
          icon={Film}
          description="By all members"
        />
        <StatCard
          title="Your Contributions"
          value={stats.totalWatchedByCurrentUser}
          icon={TrendingUp}
          description={`${Math.round((stats.totalWatchedByCurrentUser / stats.totalWatchedMovies) * 100) || 0}% of total`}
        />
        <StatCard
          title="Total Watch Time"
          value={
            totalDays > 0
              ? `${totalDays}d ${totalHours % 24}h`
              : `${totalHours}h`
          }
          icon={Clock}
          description={`${stats.totalWatchTime.toLocaleString()} minutes`}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating}
          icon={Star}
          description={`Across ${stats.uniqueGenres} genres`}
        />
      </div>
      {nextMovie ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Next Up</h2>
          </div>
          <NextMovieCard movieData={nextMovie} />
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Film className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No Upcoming Movies</h3>
            <a
              href="/discover"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Discover Movies
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeletonWrapper />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardSkeletonWrapper() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardSkeleton />
    </div>
  )
}
