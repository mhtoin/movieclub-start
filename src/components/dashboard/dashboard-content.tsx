import { DashboardChart } from '@/components/dashboard/dashboard-chart'
import { DashboardSection } from '@/components/dashboard/dashboard-section'
import { EmptyState } from '@/components/dashboard/empty-state'
import { MovieSpotlight } from '@/components/dashboard/movie-spotlight'
import { MoviesByUserList } from '@/components/dashboard/movies-by-user'
import { PeopleList } from '@/components/dashboard/people-list'
import { FilterScope, ScopeToggle } from '@/components/dashboard/scope-toggle'
import { StatCard } from '@/components/dashboard/stat-card'
import {
  HighestRatedList,
  LongestMoviesList,
} from '@/components/dashboard/top-movies-list'
import { PageTitleBar } from '@/components/page-titlebar'
import {
  Tab,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsRoot,
} from '@/components/ui/tabs'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { cn } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Calendar,
  Clapperboard,
  Clock,
  Film,
  Globe,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import { useState } from 'react'

const tabs: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'overview', label: 'Overview', icon: Film },
  { value: 'genres', label: 'Genres & Ratings', icon: BarChart3 },
  { value: 'people', label: 'Cast & Crew', icon: Users },
  { value: 'deep-dive', label: 'Deep Dive', icon: TrendingUp },
]

interface DashboardContentProps {
  user: { userId: string; name?: string; email?: string } | null
}

export function DashboardContent({ user }: DashboardContentProps) {
  const userId = user?.userId || ''
  const [scope, setScope] = useState<FilterScope>('everyone')

  const { data: stats } = useSuspenseQuery(dashboardQueries.stats(userId))
  const { data: globalInsights } = useSuspenseQuery(dashboardQueries.insights())
  const { data: userInsights } = useSuspenseQuery(
    dashboardQueries.insights(userId),
  )
  const { data: nextMovie } = useSuspenseQuery(dashboardQueries.nextMovie())

  const isMine = scope === 'mine'
  const insights = isMine ? userInsights : globalInsights

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
    <div className="flex flex-col px-6">
      <PageTitleBar
        title="Dashboard"
        kicker={`Welcome back, ${user?.name || user?.email}`}
        description="Your movie club at a glance"
      />

      <div className="mb-6 p-4 border-2 border-primary bg-primary/5 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2">Filter by:</p>
        <ScopeToggle value={scope} onChange={setScope} />
      </div>

      <TabsRoot defaultValue="overview" variant="underlined">
        <TabsList variant="underlined" className="mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Tab key={tab.value} value={tab.value} variant="underlined">
                <Icon className="h-4 w-4 mr-2 hidden sm:inline-block" />
                {tab.label}
              </Tab>
            )
          })}
          <TabsIndicator variant="underlined" />
        </TabsList>
        <TabsPanel value="overview" variant="underlined">
          <div className="space-y-6">
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
                description={
                  isMine ? `${userPercentage}% of total` : 'By all members'
                }
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
                  totalDays > 0
                    ? `${totalDays}d ${totalHours % 24}h`
                    : `${totalHours}h`
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
            <div className="min-h-[500px]">
              {nextMovie ? (
                <MovieSpotlight movieData={nextMovie} />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </TabsPanel>
        <TabsPanel value="genres" variant="underlined">
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
        </TabsPanel>
        <TabsPanel value="people" variant="underlined">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-6">
            <DashboardSection
              title="Most Seen Directors"
              icon={Clapperboard}
              description="Directors with the most films in your watchlist"
            >
              <PeopleList
                data={insights.topDirectors}
                emptyMessage="No director data yet"
              />
            </DashboardSection>
            <DashboardSection
              title="Most Seen Actors"
              icon={Users}
              description="Actors appearing in the most watched films"
            >
              <PeopleList
                data={insights.topCast}
                emptyMessage="No cast data yet"
              />
            </DashboardSection>
          </div>
        </TabsPanel>
        <TabsPanel value="deep-dive" variant="underlined">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-6">
            <DashboardSection
              title="Release Decades"
              icon={Calendar}
              description="Distribution of watched movies by release decade"
            >
              <DashboardChart
                type="area"
                data={insights.decadeDistribution}
                categoryKey="decade"
                valueKey="count"
                xAxisLabel="Release decade"
                yAxisLabel="Movies"
                valueSuffix=" movies"
                emptyMessage="No decade data yet"
              />
            </DashboardSection>
            <DashboardSection
              title="Original Language"
              icon={Globe}
              description="Which languages your movies were made in"
            >
              <DashboardChart
                type="pie"
                data={insights.languageDistribution}
                categoryKey="language"
                valueKey="count"
                valueSuffix=" movies"
                emptyMessage="No language data yet"
              />
            </DashboardSection>
          </div>
        </TabsPanel>
      </TabsRoot>
    </div>
  )
}
