import { DashboardSection } from '@/components/dashboard/dashboard-section'
import { PeopleList } from '@/components/dashboard/people-list'
import { FilterScope } from '@/components/dashboard/scope-toggle'
import { useInsights } from '@/components/dashboard/use-insights'
import { Clapperboard, Users } from 'lucide-react'

export function PeopleTabContent({
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
        <PeopleList data={insights.topCast} emptyMessage="No cast data yet" />
      </DashboardSection>
    </div>
  )
}
