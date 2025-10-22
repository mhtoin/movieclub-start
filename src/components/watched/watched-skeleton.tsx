import { Skeleton } from '@/components/ui/skeleton'

export default function WatchedSkeleton() {
  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        {Array.from({ length: 3 }, (_, monthIndex) => (
          <div key={monthIndex} className="space-y-8">
            <div className="relative">
              <div className="flex items-center gap-4 my-6">
                <div className="relative z-10 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center">
                  <Skeleton className="w-4 h-4" />
                </div>
                <div className="bg-background border rounded-lg px-4 py-2">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="ml-12 space-y-4">
                {Array.from({ length: 4 }, (_, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-card border rounded-lg p-4 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-16 h-24 rounded-md flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-16 mb-2" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-12" />
                            <Skeleton className="h-5 w-5 rounded" />
                          </div>
                        </div>
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
