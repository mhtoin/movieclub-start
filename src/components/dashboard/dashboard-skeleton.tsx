import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Main Content - Movie Spotlight Skeleton */}
      <div className="flex-1 rounded-lg border bg-card overflow-hidden min-h-[600px]">
        <div className="relative h-full p-8 lg:p-12">
          <div className="space-y-6 mb-8">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster Skeleton */}
            <Skeleton className="w-48 lg:w-64 h-72 lg:h-96 rounded-lg" />

            {/* Info Skeleton */}
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>

              <div className="flex gap-3">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>

              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="flex gap-3">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Stats Skeleton */}
      <div className="w-full lg:w-80 xl:w-96 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-11 w-11 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
