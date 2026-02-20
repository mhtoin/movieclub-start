import { DeepDiveTabContent } from '@/components/dashboard/deep-dive-tab-content'
import { GenresTabContent } from '@/components/dashboard/genres-tab-content'
import { InsightsSkeleton } from '@/components/dashboard/insights-skeleton'
import { PeopleTabContent } from '@/components/dashboard/people-tab-content'
import { FilterScope, ScopeToggle } from '@/components/dashboard/scope-toggle'
import { SpotlightSection } from '@/components/dashboard/spotlight-section'
import { StatCardsSection } from '@/components/dashboard/stat-cards-section'
import { StatCardsSkeleton } from '@/components/dashboard/stat-cards-skeleton'
import { PageTitleBar } from '@/components/page-titlebar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tab,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsRoot,
} from '@/components/ui/tabs'
import type { LucideIcon } from 'lucide-react'
import { BarChart3, Film, TrendingUp, Users } from 'lucide-react'
import { Suspense, useState } from 'react'

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
            <Suspense fallback={<StatCardsSkeleton />}>
              <StatCardsSection userId={userId} scope={scope} />
            </Suspense>
            <div className="min-h-[500px]">
              <Suspense
                fallback={<Skeleton className="w-full h-[500px] rounded-lg" />}
              >
                <SpotlightSection />
              </Suspense>
            </div>
          </div>
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
