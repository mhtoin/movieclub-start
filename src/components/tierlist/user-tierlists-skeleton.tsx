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
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mt-3 mb-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-64" />
          <div className="flex items-center gap-4 mt-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-5">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="ticket-card overflow-hidden bg-card shadow-sm"
            >
              <div className="flex items-stretch">
                <div className="shrink-0 w-[88px] p-3 flex items-center justify-center bg-muted/30">
                  <div className="flex gap-0.5 h-[72px] w-full rounded overflow-hidden">
                    {Array.from({ length: 4 }).map((_item, j) => (
                      <Skeleton key={j} className="flex-1" />
                    ))}
                  </div>
                </div>
                <div className="w-px self-stretch border-l border-dashed border-border/50 my-3" />
                <div className="flex-1 p-4 space-y-2 flex flex-col justify-center">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-16" />
                  <div className="flex gap-1 pt-1">
                    <Skeleton className="h-5 w-12 rounded" />
                    <Skeleton className="h-5 w-16 rounded" />
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
