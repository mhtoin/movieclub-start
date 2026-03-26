import { CompactStat } from '@/components/dashboard/stat-card'
import { FilterScope } from '@/components/dashboard/scope-toggle'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Clock, Film, Star } from 'lucide-react'

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

  const totalHours = Math.floor(watchTime / 60)
  const totalDays = Math.floor(totalHours / 24)

  return (
    <div className="flex flex-wrap items-center gap-6 md:gap-10">
      <CompactStat
        label={isMine ? 'My Movies' : 'Movies Watched'}
        value={watchedCount.toLocaleString()}
        icon={Film}
      />
      <CompactStat
        label="Watch Time"
        value={
          totalDays > 0 ? `${totalDays}d ${totalHours % 24}h` : `${totalHours}h`
        }
        icon={Clock}
      />
      <CompactStat
        label="Avg Rating"
        value={avgRating > 0 ? avgRating.toFixed(1) : '—'}
        icon={Star}
      />
    </div>
  )
}
