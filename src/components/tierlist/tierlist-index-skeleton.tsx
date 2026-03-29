import { Skeleton } from '@/components/ui/skeleton'

export function TierlistIndexSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="break-inside-avoid">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: i % 3 === 0 ? 1 : 2 }).map((_, j) => (
                <div
                  key={j}
                  className="bg-card border border-border/60 rounded-xl overflow-hidden"
                >
                  <Skeleton className="h-24 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="flex gap-4 pt-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
