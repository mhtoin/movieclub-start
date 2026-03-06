import { Skeleton } from '@/components/ui/skeleton'

// Accent colours that mirror getTierColors in tier-container.tsx (values 0-4)
const TIER_ACCENT = [
  'bg-violet-500', // value 0
  'bg-red-500', // value 1
  'bg-orange-500', // value 2
  'bg-amber-500', // value 3
  'bg-lime-500', // value 4
]

const TIER_BG = [
  'bg-violet-500/5',
  'bg-red-500/5',
  'bg-orange-500/5',
  'bg-amber-500/5',
  'bg-lime-500/5',
]

const TIER_CARD_COUNTS = [4, 3, 5, 2, 1]

// A single movie poster card — mirrors TierItem w-32 / aspect-[2/3]
function MovieCardSkeleton() {
  return (
    <div className="w-32 shrink-0">
      <Skeleton className="w-full aspect-[2/3] rounded-lg" />
    </div>
  )
}

export function TierlistDetailSkeleton() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-2">
      <div className="page-titlebar">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-9 w-24 rounded-md shrink-0 mt-1" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-4 px-6">
        <Skeleton className="h-7 w-40 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="flex-1 overflow-y-auto pr-20">
        <div className="p-6 space-y-4">
          {TIER_CARD_COUNTS.map((count, i) => (
            <div
              key={i}
              className={`relative rounded-md overflow-hidden ${TIER_BG[i]}`}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${TIER_ACCENT[i]}`}
              />
              <div
                className={`flex items-center justify-between gap-4 px-4 pl-5 py-3 border-b border-border/30 ${TIER_BG[i]}`}
              >
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="p-4 pl-5">
                <div className="flex flex-wrap gap-3 min-h-[120px] items-start content-start">
                  {Array.from({ length: count }).map((_, j) => (
                    <MovieCardSkeleton key={j} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-stretch">
        <div className="flex flex-col items-center justify-center gap-2 px-2 py-4 rounded-l-xl border-y-2 border-l-2 bg-background/95 border-border/70 backdrop-blur-md">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-3 h-16 rounded" />
        </div>
        <div className="w-72 max-h-[70vh] flex flex-col border-y-2 border-l-2 bg-background/95 border-border/50 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2 overflow-y-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
