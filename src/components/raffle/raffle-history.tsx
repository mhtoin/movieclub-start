import { Skeleton } from '@/components/ui/skeleton'
import { raffleQueries } from '@/lib/react-query/queries/raffle'
import { formatRaffleDate, getMoviePosterUrl } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { History } from 'lucide-react'

export function RaffleHistory() {
  const { data: history = [], isLoading } = useQuery(raffleQueries.history())

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <History className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Past Raffles</h3>
        {!isLoading && history.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground bg-muted/50 rounded-full px-2.5 py-1">
            {history.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <Skeleton className="w-10 h-14 rounded-md flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-40 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <Skeleton className="h-3 w-20 rounded ml-auto" />
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-5 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <History className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              No raffles yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your first raffle result will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border max-h-96 lg:max-h-[60vh] overflow-y-auto">
          {history.map((entry) => {
            const posterUrl = entry.movie
              ? getMoviePosterUrl(entry.movie, 'w92')
              : null
            const dateLabel = formatRaffleDate(entry.date)

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="w-10 h-14 rounded-md overflow-hidden flex-shrink-0 border border-border/60 bg-muted">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={entry.movie?.title ?? 'Movie'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-lg">
                      🎬
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {entry.movie?.title ?? 'Unknown movie'}
                  </p>
                  {entry.winner && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {entry.winner.image && (
                        <img
                          src={entry.winner.image}
                          alt={entry.winner.name}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <p className="text-xs text-muted-foreground truncate">
                        {entry.winner.name}
                      </p>
                    </div>
                  )}
                </div>
                <time className="text-xs text-muted-foreground flex-shrink-0">
                  {dateLabel}
                </time>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
