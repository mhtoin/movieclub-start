import { memo, useMemo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useReducedMotion } from 'framer-motion'
import { ArrowRight, Calendar, Film, Ticket } from 'lucide-react'
import type { Movie } from '@/db/schema/movies'
import { movieQueries } from '@/lib/react-query/queries/movies'

interface HistoryStripProps {
  movies: Array<Movie>
}

export const HistoryStrip = memo(function HistoryStrip({
  movies,
}: HistoryStripProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-primary" />
          <Film className="size-4 text-primary flex-shrink-0" />
          <span className="font-cinema-caps text-sm md:text-base tracking-[0.15em] text-primary uppercase">
            Recently Watched
          </span>
        </div>
        <Link
          to="/watched"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {movies.length === 0 ? (
        <div className="flex items-center justify-center gap-4 py-14 px-6 rounded-2xl border-2 border-dashed border-border/30 bg-muted/10">
          <Ticket className="size-6 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground font-medium">
            No movies watched yet. Run your first raffle to get started.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div
            className="absolute top-[88px] sm:top-[104px] md:top-[120px] left-0 right-0 h-0.5"
            style={{
              background:
                'repeating-linear-gradient(to right, var(--border) 0, var(--border) 8px, transparent 8px, transparent 14px)',
            }}
          />
          <div className="flex gap-5 md:gap-7 overflow-x-auto pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 no-scrollbar snap-x snap-mandatory">
            {movies.map((movie, index) => {
              const posterPath =
                (movie.images as any)?.posters?.[0]?.file_path ?? null
              const posterUrl = posterPath
                ? `https://image.tmdb.org/t/p/w154${posterPath}`
                : null
              const watchDate = movie.watchDate
                ? new Date(movie.watchDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : null

              return (
                <div
                  key={movie.id}
                  suppressHydrationWarning
                  className="snap-start flex-shrink-0 relative"
                  style={{
                    width: 'clamp(7rem, 18vw, 10rem)',
                    opacity: 0,
                    animation: shouldReduceMotion
                      ? 'none'
                      : `fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s forwards`,
                  }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                      {watchDate ?? `Scene ${index + 1}`}
                    </span>
                    <div className="group relative overflow-hidden rounded-lg bg-muted shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                      <div className="aspect-[2/3]">
                        {posterUrl ? (
                          <img
                            src={posterUrl}
                            alt={movie.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Ticket className="size-8 text-muted-foreground/25" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5">
                        {watchDate && (
                          <span className="text-[10px] font-medium text-white/90 flex items-center gap-1">
                            <Calendar className="size-3" />
                            {watchDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative mt-4 flex flex-col items-center">
                      <div className="size-2 rounded-full bg-primary/80 z-10" />
                      <p className="mt-2 text-xs font-semibold text-foreground text-center line-clamp-1 max-w-full">
                        {movie.title}
                      </p>
                      {movie.releaseDate && (
                        <p
                          suppressHydrationWarning
                          className="text-[10px] text-muted-foreground mt-0.5"
                        >
                          {new Date(movie.releaseDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
})

export function HistoryStripSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 animate-pulse rounded bg-muted" />
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex gap-5 md:gap-7 overflow-hidden pb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 space-y-2"
            style={{ width: 'clamp(7rem, 18vw, 10rem)' }}
          >
            <div className="aspect-[2/3] rounded-lg animate-pulse bg-muted" />
            <div className="h-3 w-20 mx-auto animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function HistoryStripSuspense() {
  const { data: allWatched = [] } = useSuspenseQuery(movieQueries.allWatched())
  const recentWatches = useMemo(() => allWatched.slice(0, 6), [allWatched])
  return <HistoryStrip movies={recentWatches} />
}
