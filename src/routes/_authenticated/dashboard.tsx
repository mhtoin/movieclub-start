import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { EmptyState } from '@/components/dashboard/empty-state'
import { MovieSpotlight } from '@/components/dashboard/movie-spotlight'
import { StatCard } from '@/components/dashboard/stat-card'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Clock, Film, Star, TrendingUp, Trophy } from 'lucide-react'
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
  const userPercentage =
    stats.totalWatchedMovies > 0
      ? Math.round(
          (stats.totalWatchedByCurrentUser / stats.totalWatchedMovies) * 100,
        )
      : 0

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 lg:px-8 pt-6 pb-4">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your movie watching dashboard
        </p>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 lg:px-8 pb-8 overflow-hidden">
        <div className="flex-1 min-h-[600px] lg:min-h-0">
          {nextMovie ? (
            <MovieSpotlight movieData={nextMovie} />
          ) : (
            <EmptyState />
          )}
        </div>
        <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 lg:overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Your Statistics</h2>
            </div>

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
              description={`${userPercentage}% of total watched`}
            />

            <StatCard
              title="Total Watch Time"
              value={
                totalDays > 0
                  ? `${totalDays}d ${totalHours % 24}h`
                  : `${totalHours}h`
              }
              icon={Clock}
              description={`${stats.totalWatchTime.toLocaleString()} minutes total`}
            />

            <StatCard
              title="Average Rating"
              value={stats.averageRating}
              icon={Star}
              description={`Across ${stats.uniqueGenres} unique genres`}
            />

            <StatCard
              title="Genres Explored"
              value={stats.uniqueGenres}
              icon={Film}
              description="Different movie genres"
            />
          </div>
        </aside>
      </div>
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
    <div className="h-full flex flex-col">
      <div className="px-4 lg:px-8 pt-6 pb-4">
        <div className="h-9 w-64 bg-muted rounded animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse mt-2" />
      </div>
      <div className="flex-1 px-4 lg:px-8 pb-8 overflow-hidden">
        <DashboardSkeleton />
      </div>
    </div>
  )
}
