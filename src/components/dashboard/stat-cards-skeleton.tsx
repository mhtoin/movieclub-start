import { Skeleton } from '@/components/ui/skeleton'

export function StatCardsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
