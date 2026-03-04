import { Skeleton } from '@/components/ui/skeleton'

export function ShortlistsSkeleton() {
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Stats row */}
      <div className="flex gap-3">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full" />
      </div>
      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border overflow-hidden"
          >
            {/* Top accent strip */}
            <Skeleton className="h-1 w-full rounded-none" />
            {/* Card header */}
            <div className="flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-border">
              <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            {/* Movie rows */}
            <div className="flex flex-col py-1.5 gap-0">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex gap-3 px-3 py-3 mx-1">
                  <Skeleton className="w-12 aspect-[2/3] rounded-md flex-shrink-0" />
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <Skeleton className="h-3.5 w-4/5 rounded" />
                    <Skeleton className="h-3 w-2/3 rounded" />
                    <div className="flex gap-1">
                      <Skeleton className="h-4 w-14 rounded-full" />
                      <Skeleton className="h-4 w-14 rounded-full" />
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
