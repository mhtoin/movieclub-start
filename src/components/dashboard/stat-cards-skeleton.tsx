import { Skeleton } from '@/components/ui/skeleton'

export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-6 md:gap-10">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}
