import { DashboardChart } from '@/components/dashboard/dashboard-chart'
import { DashboardSection } from '@/components/dashboard/dashboard-section'
import { MoviesByUserList } from '@/components/dashboard/movies-by-user'
import { FilterScope } from '@/components/dashboard/scope-toggle'
import {
  HighestRatedList,
  LongestMoviesList,
} from '@/components/dashboard/top-movies-list'
import { useInsights } from '@/components/dashboard/use-insights'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { useSuspenseQuery } from '@tanstack/react-query'
import { BarChart3, Clock, Star, Trophy, Users } from 'lucide-react'

export function GenresTabContent({
  userId,
  scope,
}: {
  userId: string
  scope: FilterScope
}) {
  const isMine = scope === 'mine'
  const { data: stats } = useSuspenseQuery(dashboardQueries.stats(userId))
  const insights = useInsights(userId, scope)
  const watchedCount = isMine
    ? stats.totalWatchedByCurrentUser
    : stats.totalWatchedMovies

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection
          title="Genre Distribution"
          icon={BarChart3}
          description="Number of watched movies per genre"
        >
          <DashboardChart
            type="horizontal-bar"
            data={insights.genreDistribution}
            categoryKey="genre"
            valueKey="count"
            xAxisLabel="Number of movies"
            valueSuffix=" movies"
            height="auto"
            emptyMessage="No genre data yet"
            barGap={5}
            maxBarSize={24}
            barCategoryGap="20%"
          />
        </DashboardSection>
        <DashboardSection
          title="TMDB Rating Distribution"
          icon={Star}
          description="How watched movies score on TMDB (0–10 scale)"
        >
          <DashboardChart
            type="horizontal-bar"
            data={insights.ratingDistribution}
            categoryKey="range"
            valueKey="count"
            xAxisLabel="Movies"
            yAxisLabel="Rating"
            valueSuffix=" movies"
            height="auto"
            emptyMessage="No rating data yet"
            maxBarSize={40}
            barGap={8}
            barCategoryGap="15%"
          />
        </DashboardSection>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardSection
          title="Highest Rated"
          icon={Trophy}
          description="Top 5 movies by TMDB audience score"
        >
          <HighestRatedList data={insights.highestRated} />
        </DashboardSection>
        <DashboardSection
          title="Longest Movies"
          icon={Clock}
          description="Top 5 longest runtimes in the collection"
        >
          <LongestMoviesList data={insights.longestMovies} />
        </DashboardSection>
        <DashboardSection
          title="Movies by Member"
          icon={Users}
          description="Contributions per club member"
        >
          <MoviesByUserList
            data={insights.moviesByUser}
            totalMovies={watchedCount}
          />
        </DashboardSection>
      </div>
    </div>
  )
}
