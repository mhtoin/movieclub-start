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
import { BarChart3, Clock, GitFork, Star, Trophy, Users } from 'lucide-react'

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
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
        </div>
        <DashboardSection
          title="Top Rated"
          icon={Trophy}
          description="Your highest scoring movies"
        >
          <HighestRatedList data={insights.highestRated} />
        </DashboardSection>
      </div>

      {insights.genrePairs.length > 0 && (
        <DashboardSection
          title="Genre Combinations"
          icon={GitFork}
          description="Most frequent 2-genre pairings"
        >
          <DashboardChart
            type="horizontal-bar"
            data={insights.genrePairs}
            categoryKey="pair"
            valueKey="count"
            xAxisLabel="Movies"
            valueSuffix=" movies"
            height="auto"
            emptyMessage="No genre combinations yet"
            barGap={5}
            maxBarSize={24}
            barCategoryGap="20%"
          />
        </DashboardSection>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardSection
          title="Rating Distribution"
          icon={Star}
          description="How your movies score on TMDB"
        >
          <DashboardChart
            type="bar"
            data={insights.ratingDistribution}
            categoryKey="range"
            valueKey="count"
            xAxisLabel="Rating"
            yAxisLabel="Movies"
            valueSuffix=" movies"
            height="auto"
            emptyMessage="No rating data yet"
            maxBarSize={40}
            barGap={8}
            barCategoryGap="15%"
          />
        </DashboardSection>
        <DashboardSection
          title="Longest Movies"
          icon={Clock}
          description="Marathon-worthy runtimes"
        >
          <LongestMoviesList data={insights.longestMovies} />
        </DashboardSection>
      </div>

      <div>
        <DashboardSection
          title="Movies by Member"
          icon={Users}
          description="Who's been adding what"
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
