import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, lazy, useState } from 'react'
import { BarChart3, Film, TrendingUp, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FilterScope } from '@/components/dashboard/scope-toggle'
import { ScopeToggle } from '@/components/dashboard/scope-toggle'
import { InsightsSkeleton } from '@/components/dashboard/insights-skeleton'
import { StatCardsSection } from '@/components/dashboard/stat-cards-section'
import { StatCardsSkeleton } from '@/components/dashboard/stat-cards-skeleton'
import { PageTitleBar } from '@/components/page-titlebar'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { OverviewInsights } from '@/components/dashboard/overview-insights'
import {
  Tab,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsRoot,
} from '@/components/ui/tabs'

const GenresTabContent = lazy(() =>
  import('@/components/dashboard/genres-tab-content').then((m) => ({
    default: m.GenresTabContent,
  })),
)
const PeopleTabContent = lazy(() =>
  import('@/components/dashboard/people-tab-content').then((m) => ({
    default: m.PeopleTabContent,
  })),
)
const DeepDiveTabContent = lazy(() =>
  import('@/components/dashboard/deep-dive-tab-content').then((m) => ({
    default: m.DeepDiveTabContent,
  })),
)

const tabs: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: 'overview', label: 'Overview', icon: Film },
  { value: 'genres', label: 'Genres & Ratings', icon: BarChart3 },
  { value: 'people', label: 'Cast & Crew', icon: Users },
  { value: 'deep-dive', label: 'Insights', icon: TrendingUp },
]

interface DashboardContentProps {
  user: { userId: string; name?: string; email?: string } | null
}

export function DashboardContent({ user }: DashboardContentProps) {
  const userId = user?.userId || ''
  const [scope, setScope] = useState<FilterScope>('everyone')

  const { data: nextMovie } = useSuspenseQuery(dashboardQueries.nextMovie())

  return (
    <div className="flex flex-col px-6 pb-12">
      <div className="flex flex-col gap-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <PageTitleBar
            title="Dashboard"
            kicker={`Welcome back, ${user?.name || user?.email}`}
            description="Your movie club at a glance"
          />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              Filter:
            </span>
            <ScopeToggle value={scope} onChange={setScope} />
          </div>
        </div>

        <Suspense fallback={<StatCardsSkeleton />}>
          <StatCardsSection userId={userId} scope={scope} />
        </Suspense>

        {nextMovie && (
          <div className="text-sm text-muted-foreground">
            Next up:{' '}
            <span className="font-medium text-foreground">
              {nextMovie.movie.title}
            </span>{' '}
            <span className="opacity-60">picked by {nextMovie.user.name}</span>
          </div>
        )}
      </div>

      <TabsRoot defaultValue="overview" variant="underlined" className="mt-8">
        <TabsList variant="underlined" className="mb-8 overflow-x-auto">
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
          <Suspense fallback={<InsightsSkeleton />}>
            <OverviewInsights userId={userId} scope={scope} />
          </Suspense>
        </TabsPanel>

        <TabsPanel value="genres" variant="underlined">
          <Suspense fallback={<InsightsSkeleton />}>
            <GenresTabContent userId={userId} scope={scope} />
          </Suspense>
        </TabsPanel>

        <TabsPanel value="people" variant="underlined">
          <Suspense fallback={<InsightsSkeleton />}>
            <PeopleTabContent userId={userId} scope={scope} />
          </Suspense>
        </TabsPanel>

        <TabsPanel value="deep-dive" variant="underlined">
          <Suspense fallback={<InsightsSkeleton />}>
            <DeepDiveTabContent userId={userId} scope={scope} />
          </Suspense>
        </TabsPanel>
      </TabsRoot>
    </div>
  )
}
