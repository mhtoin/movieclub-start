import { DashboardChart } from '@/components/dashboard/dashboard-chart'
import { DashboardSection } from '@/components/dashboard/dashboard-section'
import { FilterScope } from '@/components/dashboard/scope-toggle'
import { useInsights } from '@/components/dashboard/use-insights'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Calendar, Clapperboard, Globe } from 'lucide-react'

export function DeepDiveTabContent({
  userId,
  scope,
}: {
  userId: string
  scope: FilterScope
}) {
  const insights = useInsights(userId, scope)
  const { data: stats } = useSuspenseQuery(dashboardQueries.stats(userId))

  const isMine = scope === 'mine'
  const genreCount = isMine ? stats.userUniqueGenres : stats.uniqueGenres
  const genres = insights.genreDistribution.slice(0, 5)

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-6">
        <DashboardSection
          title="Release Decades"
          icon={Calendar}
          description="When your movies were born"
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
          title="Languages"
          icon={Globe}
          description="Where your movies come from"
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

      {genres.length > 0 && (
        <DashboardSection
          title="Top Genres"
          icon={Clapperboard}
          description={`${genreCount} genres explored total`}
        >
          <div className="flex flex-wrap gap-2">
            {genres.map((g: any) => (
              <span
                key={g.genre}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20"
              >
                {g.genre}
                <span className="text-xs opacity-60">{g.count}</span>
              </span>
            ))}
          </div>
        </DashboardSection>
      )}
    </div>
  )
}
