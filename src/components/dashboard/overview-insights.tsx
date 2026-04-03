import { useSuspenseQuery } from '@tanstack/react-query'
import { Flame, Lightbulb, Timer, TrendingUp, Users } from 'lucide-react'
import type { FilterScope } from '@/components/dashboard/scope-toggle'
import { DashboardChart } from '@/components/dashboard/dashboard-chart'
import { DashboardSection } from '@/components/dashboard/dashboard-section'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { getImageUrl } from '@/lib/tmdb-api'

interface OverviewInsightsProps {
  userId: string
  scope: FilterScope
}

export function OverviewInsights({ userId, scope }: OverviewInsightsProps) {
  const isMine = scope === 'mine'
  const { data: insights } = useSuspenseQuery(
    dashboardQueries.insights(isMine ? userId : undefined),
  )

  const topGenres = insights.genreDistribution.slice(0, 6)
  const topUsers = insights.moviesByUser.slice(0, 6)
  const topMovie = insights.highestRated[0]
  const totalMovies = insights.ratingDistribution.reduce(
    (sum, r) => sum + r.count,
    0,
  )
  const totalMinutes = insights.longestMovies.reduce(
    (sum, m) => sum + (m.runtime || 0),
    0,
  )
  const avgRuntime =
    topGenres.length > 0 ? Math.round(totalMinutes / (totalMovies || 1)) : 0
  const highRatings = insights.ratingDistribution
    .filter((r) => parseInt(r.range) >= 7)
    .reduce((sum, r) => sum + r.count, 0)
  const ratingPercent =
    totalMovies > 0 ? Math.round((highRatings / totalMovies) * 100) : 0
  const maxGenreCount = topGenres[0]?.count || 1
  const maxUserCount = topUsers[0]?.count || 1

  if (totalMovies === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      {!isMine && topUsers.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Movies by User
          </p>
          <div className="space-y-2">
            {topUsers.map((user, i) => (
              <div key={user.userName} className="flex items-center gap-3">
                <span className="text-sm w-28 truncate text-muted-foreground">
                  {user.userName}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(user.count / maxUserCount) * 100}%`,
                      backgroundColor: `oklch(0.67 0.14 ${i * 30 + 30})`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium w-8 text-right">
                  {user.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.ratingTrend.length > 1 && (
        <DashboardSection
          title="Rating Trend"
          icon={TrendingUp}
          description="Average rating over time"
        >
          <DashboardChart
            type="area"
            data={insights.ratingTrend}
            categoryKey="month"
            valueKey="avgRating"
            xAxisLabel="Month"
            yAxisLabel="Avg Rating"
            valueSuffix=""
            height={200}
            emptyMessage="Not enough data"
          />
        </DashboardSection>
      )}

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
          Top Genres
        </p>
        <div className="space-y-2">
          {topGenres.map((genre, i) => (
            <div key={genre.genre} className="flex items-center gap-3">
              <span className="text-sm w-28 truncate text-muted-foreground">
                {genre.genre}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(genre.count / maxGenreCount) * 100}%`,
                    backgroundColor: `oklch(0.67 0.14 ${i * 30 + 30})`,
                  }}
                />
              </div>
              <span className="text-xs font-medium w-8 text-right">
                {genre.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Quality
            </span>
          </div>
          <p className="text-2xl font-bold">{ratingPercent}%</p>
          <p className="text-xs text-muted-foreground mt-1">rated 7+</p>
        </div>

        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Avg Runtime
            </span>
          </div>
          <p className="text-2xl font-bold">{avgRuntime}m</p>
          <p className="text-xs text-muted-foreground mt-1">per movie</p>
        </div>
      </div>
      {topMovie && (
        <div className="p-4 rounded-lg border border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-3">
            Highest Rated
          </p>
          <div className="flex items-center gap-3">
            {topMovie.posterPath ? (
              <div className="w-12 h-16 rounded-md overflow-hidden border border-border flex-shrink-0">
                <img
                  src={getImageUrl(topMovie.posterPath, 'w185') ?? ''}
                  alt={topMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                <Flame className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{topMovie.title}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-sm font-bold text-primary">
                  {topMovie.rating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {topMovie.year}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {insights.topDirectors.length > 0 && (
        <div className="p-4 rounded-lg border border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-3">
            Most Watched Director
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{insights.topDirectors[0].name}</p>
              <p className="text-xs text-muted-foreground">
                {insights.topDirectors[0].count} movie
                {insights.topDirectors[0].count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
