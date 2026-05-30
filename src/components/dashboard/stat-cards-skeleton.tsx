import { Skeleton } from '@/components/ui/skeleton'

export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-6 md:gap-10">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <div>
            <Skeleton className="h-3 w-20 mb-1.5" />
            <Skeleton className="h-6 w-14" />
          </div>
        </div>
      ))}
    </div>
  )
}
