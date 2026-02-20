import { FilterScope } from '@/components/dashboard/scope-toggle'
import { StatCard } from '@/components/dashboard/stat-card'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { cn } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Clapperboard, Clock, Film, Star, TrendingUp } from 'lucide-react'

export function StatCardsSection({
  userId,
  scope,
}: {
  userId: string
  scope: FilterScope
}) {
  const { data: stats } = useSuspenseQuery(dashboardQueries.stats(userId))
  const isMine = scope === 'mine'

  const watchedCount = isMine
    ? stats.totalWatchedByCurrentUser
    : stats.totalWatchedMovies
  const watchTime = isMine ? stats.userWatchTime : stats.totalWatchTime
  const avgRating = isMine ? stats.userAverageRating : stats.averageRating
  const genreCount = isMine ? stats.userUniqueGenres : stats.uniqueGenres

  const totalHours = Math.floor(watchTime / 60)
  const totalDays = Math.floor(totalHours / 24)
  const userPercentage =
    stats.totalWatchedMovies > 0
      ? Math.round(
          (stats.totalWatchedByCurrentUser / stats.totalWatchedMovies) * 100,
        )
      : 0

  return (
    <div
      className={cn(
        'grid gap-4',
        isMine
          ? 'grid-cols-2 md:grid-cols-4'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
      )}
    >
      <StatCard
        title={isMine ? 'My Movies' : 'Movies Watched'}
        value={watchedCount}
        icon={Film}
        description={isMine ? `${userPercentage}% of total` : 'By all members'}
      />
      {!isMine && (
        <StatCard
          title="Your Picks"
          value={stats.totalWatchedByCurrentUser}
          icon={TrendingUp}
          description={`${userPercentage}% of total`}
        />
      )}
      <StatCard
        title="Watch Time"
        value={
          totalDays > 0 ? `${totalDays}d ${totalHours % 24}h` : `${totalHours}h`
        }
        icon={Clock}
        description={`${watchTime.toLocaleString()} min`}
      />
      <StatCard
        title="Avg Rating"
        value={avgRating}
        icon={Star}
        description="TMDB average"
      />
      <StatCard
        title="Genres"
        value={genreCount}
        icon={Clapperboard}
        description="Explored so far"
      />
    </div>
  )
}
