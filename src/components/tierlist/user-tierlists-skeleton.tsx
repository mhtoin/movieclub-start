import { Skeleton } from '@/components/ui/skeleton'

export function UserTierlistsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="grid grid-cols-3 md:grid-cols-6 h-48 md:h-64">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3]" />
          ))}
        </div>
        <div className="p-6 md:p-8 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-64" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border border-border/50 bg-card p-4"
            >
              <div className="flex gap-4">
                <div className="flex gap-0.5 h-24 w-24 shrink-0 rounded-lg overflow-hidden">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="flex-1" />
                  ))}
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                  <div className="flex gap-1 pt-1">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
