import { Skeleton } from '@/components/ui/skeleton'

export function InsightsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Skeleton className="size-8 rounded-md" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-52 w-full rounded-lg" />
        </div>
        <div className="rounded-lg border border-border bg-card p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Skeleton className="size-8 rounded-md" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-52 w-full rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  )
}
