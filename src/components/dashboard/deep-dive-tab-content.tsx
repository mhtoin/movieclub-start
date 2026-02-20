import { DashboardChart } from '@/components/dashboard/dashboard-chart'
import { DashboardSection } from '@/components/dashboard/dashboard-section'
import { FilterScope } from '@/components/dashboard/scope-toggle'
import { useInsights } from '@/components/dashboard/use-insights'
import { Calendar, Globe } from 'lucide-react'

export function DeepDiveTabContent({
  userId,
  scope,
}: {
  userId: string
  scope: FilterScope
}) {
  const insights = useInsights(userId, scope)
  return (
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
  )
}
