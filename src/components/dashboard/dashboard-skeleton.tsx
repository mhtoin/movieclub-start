import { Skeleton } from '@/components/ui/skeleton'

function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-md" />
      <div>
        <Skeleton className="h-3 w-20 mb-1.5" />
        <Skeleton className="h-6 w-14" />
      </div>
    </div>
  )
}

function TabSkeleton() {
  return <Skeleton className="h-5 w-28" />
}

export function DashboardSkeletonFull() {
  return (
    <div className="flex flex-col px-6 pb-12 md:pl-[72px] md:pr-6">
      <div className="flex flex-col gap-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28 opacity-60" />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex gap-6 border-b border-border mb-8 overflow-x-auto pb-2">
          <TabSkeleton />
          <TabSkeleton />
          <TabSkeleton />
          <TabSkeleton />
        </div>

        <div className="space-y-10">
          <Skeleton className="h-24 w-full rounded-xl border border-border" />
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-72 rounded-lg" />
              <Skeleton className="h-72 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
