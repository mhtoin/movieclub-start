import { Skeleton } from '@/components/ui/skeleton'

export function ShortlistsSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex gap-3">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/20 overflow-hidden"
          >
            <div className="flex items-stretch">
              <div className="w-[88px] flex-shrink-0 flex flex-col items-center justify-between p-4 border-r border-dashed border-border/25">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <Skeleton className="h-3 w-14 rounded" />
                </div>
                <Skeleton className="h-5 w-12 rounded" />
              </div>
              <div className="flex-1 flex flex-col p-4 gap-2.5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex gap-3 p-2 rounded-md">
                    <Skeleton className="w-10 h-14 rounded-sm flex-shrink-0" />
                    <div className="flex-1 flex flex-col justify-center gap-2">
                      <Skeleton className="h-3.5 w-4/5 rounded" />
                      <div className="flex gap-2">
                        <Skeleton className="h-3 w-12 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
