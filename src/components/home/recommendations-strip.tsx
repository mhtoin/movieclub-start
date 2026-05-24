import { memo, useCallback, useRef, useState } from 'react'
import { useQueries, useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  LazyMotion,
  domAnimation,
  m,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import { ArrowRight, Film, Plus, Sparkles, Star, Ticket } from 'lucide-react'
import type { Movie } from '@/lib/tmdb-api'
import type {
  RecommendationSeed,
  TMDBMovie,
} from '@/lib/react-query/queries/home'
import { getImageUrl } from '@/lib/tmdb-api'
import { homeQueries } from '@/lib/react-query/queries/home'
import { useAddToShortlistMutation } from '@/lib/react-query/mutations/shortlist'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { MovieDetailsDialog } from '@/components/discover/movie-details-dialog'

// --- Sprocket Hole Decorative Element ---

function SprocketLine({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-[3px] ${className ?? ''}`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="size-[5px] rounded-full border border-primary/20 bg-background shrink-0"
        />
      ))}
      <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
    </div>
  )
}

// --- Recommendation Card ---

interface RecommendationCardProps {
  movie: TMDBMovie
  onClick: (movie: Movie, rect: DOMRect) => void
  onAdd: (movieId: number) => void
  isAdding: boolean
  alreadyInShortlist: boolean
}

const RecommendationCard = memo(function RecommendationCard({
  movie,
  onClick,
  onAdd,
  isAdding,
  alreadyInShortlist,
}: RecommendationCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const posterUrl = getImageUrl(movie.poster_path, 'w342')
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null
  const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null

  const handleClick = useCallback(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      onClick(movie as unknown as Movie, rect)
    }
  }, [movie, onClick])

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onAdd(movie.id)
    },
    [movie.id, onAdd],
  )

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={handleClick}
      className="group relative flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-lg"
    >
      {/* Film frame border */}
      <div className="relative overflow-hidden rounded-lg bg-card border border-border/40 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-primary/30">
        <div className="aspect-[2/3] overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Ticket className="size-8 text-muted-foreground/25" />
            </div>
          )}

          {/* Hover overlay with add button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            {!alreadyInShortlist && (
              <button
                type="button"
                onClick={handleAdd}
                disabled={isAdding}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur-sm transition-all hover:bg-primary active:scale-95 disabled:opacity-50"
              >
                <Plus className="size-3" />
                {isAdding ? 'Adding...' : 'Shortlist'}
              </button>
            )}
            {alreadyInShortlist && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/80 px-3 py-1.5 text-xs font-semibold text-success-foreground backdrop-blur-sm">
                In shortlist
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card metadata */}
      <div className="mt-2 px-0.5">
        <p className="text-xs font-semibold text-foreground/85 line-clamp-1 leading-snug">
          {movie.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {year && (
            <span className="text-[10px] text-muted-foreground/60">{year}</span>
          )}
          {rating && (
            <>
              {year && (
                <span className="text-[10px] text-muted-foreground/25">·</span>
              )}
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
                <Star className="size-2.5 fill-warning text-warning" />
                {rating}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  )
})

// --- Seed Group ---

interface SeedGroupProps {
  seed: RecommendationSeed
  recommendations: Array<TMDBMovie>
  index: number
  onMovieClick: (movie: Movie, rect: DOMRect) => void
  onAddToShortlist: (movieId: number) => void
  addingMovieId: number | null
  shortlistMovieIds: Set<number>
}

const SeedGroup = memo(function SeedGroup({
  seed,
  recommendations,
  index,
  onMovieClick,
  onAddToShortlist,
  addingMovieId,
  shortlistMovieIds,
}: SeedGroupProps) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const seedPosterUrl = seed.posterPath
    ? `https://image.tmdb.org/t/p/w154${seed.posterPath}`
    : null

  if (recommendations.length === 0) return null

  return (
    <m.div
      ref={ref}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Seed header with poster and "because you liked" */}
      <div className="flex items-end gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className="w-12 sm:w-14 md:w-16 aspect-[2/3] overflow-hidden rounded-md bg-muted border border-border/30 shadow-sm">
            {seedPosterUrl ? (
              <img
                src={seedPosterUrl}
                alt={seed.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Film className="size-5 text-muted-foreground/30" />
              </div>
            )}
          </div>
          {/* Subtle glow behind seed poster */}
          <div
            className="absolute -inset-1 rounded-lg bg-primary/5 -z-10 blur-sm"
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 min-w-0 pb-1">
          <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-0.5">
            Because you liked
          </p>
          <p className="font-cinema-caps text-base sm:text-lg md:text-xl tracking-wide text-foreground leading-tight truncate">
            {seed.title}
          </p>
        </div>

        {recommendations.length > 3 && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium pb-1 flex-shrink-0">
            {recommendations.length} picks
          </span>
        )}
      </div>

      {/* Sprocket connecting line */}
      <SprocketLine className="mb-3" />

      {/* Horizontal scroll of recommendations */}
      <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
          {recommendations.map((movie, mIndex) => (
            <div
              key={movie.id}
              className="snap-start"
              style={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      animation: isInView
                        ? `fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + mIndex * 0.06}s forwards`
                        : 'none',
                    }
              }
            >
              <RecommendationCard
                movie={movie}
                onClick={onMovieClick}
                onAdd={onAddToShortlist}
                isAdding={addingMovieId === movie.id}
                alreadyInShortlist={shortlistMovieIds.has(movie.id)}
              />
            </div>
          ))}

          {/* "Browse more" link at the end */}
          <div className="flex-shrink-0 flex items-center pr-4">
            <Link
              to="/discover"
              className="group flex flex-col items-center justify-center gap-2 w-[100px] sm:w-[120px] aspect-[2/3] rounded-lg border-2 border-dashed border-border/40 bg-muted/20 hover:border-primary/40 hover:bg-primary/[0.03] transition-colors"
            >
              <Plus className="size-5 text-muted-foreground/50 group-hover:text-primary/70 transition-colors" />
              <span className="text-[10px] font-medium text-muted-foreground/60 group-hover:text-primary/70 transition-colors text-center leading-tight">
                Browse
                <br />
                more
              </span>
            </Link>
          </div>
        </div>
      </div>
    </m.div>
  )
})

// --- Main Recommendations Component ---

interface RecommendationsStripProps {
  userId: string
}

export const RecommendationsStrip = memo(function RecommendationsStrip({
  userId,
}: RecommendationsStripProps) {
  const shouldReduceMotion = useReducedMotion()
  const { data: seeds = [] } = useSuspenseQuery(homeQueries.seeds(userId))

  // Fetch recommendations for all seeds in parallel
  const seedQueries = useQueries({
    queries: seeds.map((seed) => homeQueries.forSeed(seed, [])),
  })

  // Get user's shortlist to know what's already added
  const { data: userShortlist } = useSuspenseQuery(
    shortlistQueries.byUser(userId),
  )
  const shortlistMovies = userShortlist?.movies ?? []
  const shortlistMovieIds = new Set(
    shortlistMovies.map((movie) => movie.tmdbId),
  )

  const { mutate: addToShortlist } = useAddToShortlistMutation()
  const [addingMovieId, setAddingMovieId] = useState<number | null>(null)

  // Dialog state
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)

  const handleMovieClick = useCallback((movie: Movie, rect: DOMRect) => {
    setSelectedMovie(movie)
    setTriggerRect(rect)
    setDialogOpen(true)
  }, [])

  const handleAddToShortlist = useCallback(
    (movieId: number) => {
      setAddingMovieId(movieId)
      addToShortlist(movieId, {
        onSettled: () => setAddingMovieId(null),
      })
    },
    [addToShortlist],
  )

  // Check if recommendation queries are still in flight
  const isRecsLoading = seedQueries.some((q) => q.isLoading)

  // Build seed + recommendation pairs
  const seedGroups = seeds
    .map((seed, index) => ({
      seed,
      recommendations: seedQueries[index]?.data ?? [],
    }))
    .filter((group) => group.recommendations.length > 0)

  // Still loading recommendations — show inline skeleton
  if (isRecsLoading || (seeds.length > 0 && seedQueries.length === 0)) {
    return (
      <div>
        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-2">
            <div className="h-px w-6 bg-primary/50" />
            <Sparkles className="size-4 text-primary/70 flex-shrink-0" />
            <span className="font-cinema-caps text-sm md:text-base tracking-[0.15em] text-primary/80 uppercase">
              Picked for You
            </span>
          </div>
          <p className="text-xs text-muted-foreground pl-[calc(1.5rem+0.75rem+1rem)]">
            Based on your tierlist
          </p>
        </div>
        <div className="space-y-10">
          {seeds.map((seed) => (
            <div key={seed.tmdbId}>
              <div className="flex items-end gap-4 mb-4">
                <div className="w-12 sm:w-14 md:w-16 aspect-[2/3] rounded-md animate-pulse bg-muted flex-shrink-0" />
                <div className="flex-1 pb-1 space-y-2">
                  <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-44 animate-pulse rounded bg-muted" />
                </div>
              </div>
              <div className="flex items-center gap-[3px] mb-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="size-[5px] rounded-full animate-pulse bg-muted shrink-0"
                  />
                ))}
                <div className="h-px flex-1 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex gap-3 sm:gap-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] space-y-2"
                  >
                    <div className="aspect-[2/3] rounded-lg animate-pulse bg-muted" />
                    <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // No seeds at all — genuine empty state
  if (seedGroups.length === 0) {
    return (
      <div>
        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-2">
            <div className="h-px w-6 bg-primary/50" />
            <Sparkles className="size-4 text-primary/70 flex-shrink-0" />
            <span className="font-cinema-caps text-sm md:text-base tracking-[0.15em] text-primary/80 uppercase">
              Picked for You
            </span>
          </div>
          <p className="text-xs text-muted-foreground pl-[calc(1.5rem+0.75rem+1rem)]">
            Based on your tierlist
          </p>
        </div>
        <m.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col items-center justify-center gap-4 py-14 px-6 rounded-2xl border-2 border-dashed border-border/30 bg-muted/10">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-6 text-primary/50" />
            </div>
            <div className="text-center max-w-sm">
              <p className="text-sm font-semibold text-foreground/70">
                No recommendations yet
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Rank movies in your tierlist and we&apos;ll find similar films
                you might enjoy.
              </p>
            </div>
            <Link
              to="/tierlist/$userId"
              params={{ userId }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="size-3.5" />
              Create a tierlist
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </m.div>
      </div>
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <div>
        {/* Section header */}
        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-2">
            <div className="h-px w-6 bg-primary/50" />
            <Sparkles className="size-4 text-primary/70 flex-shrink-0" />
            <span className="font-cinema-caps text-sm md:text-base tracking-[0.15em] text-primary/80 uppercase">
              Picked for You
            </span>
          </div>
          <p className="text-xs text-muted-foreground pl-[calc(1.5rem+0.75rem+1rem)]">
            Based on your tierlist
          </p>
        </div>

        {/* Warm background accent */}
        <div className="relative">
          <div
            className="absolute -inset-y-8 -left-8 -right-8 rounded-3xl bg-muted/30 -z-10"
            aria-hidden="true"
          />

          <div className="space-y-12">
            {seedGroups.map((group, index) => (
              <SeedGroup
                key={group.seed.tmdbId}
                seed={group.seed}
                recommendations={group.recommendations}
                index={index}
                onMovieClick={handleMovieClick}
                onAddToShortlist={handleAddToShortlist}
                addingMovieId={addingMovieId}
                shortlistMovieIds={shortlistMovieIds}
              />
            ))}
          </div>
        </div>

        {/* Movie details dialog */}
        <MovieDetailsDialog
          movie={selectedMovie}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          triggerRect={triggerRect}
        />
      </div>
    </LazyMotion>
  )
})

// --- Skeleton ---

export function RecommendationsStripSkeleton() {
  return (
    <div>
      <div className="mb-10">
        <div className="flex items-baseline gap-3 mb-2">
          <div className="h-px w-6 animate-pulse rounded bg-muted" />
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-3 w-24 animate-pulse rounded bg-muted ml-[calc(1.5rem+0.75rem+1rem)]" />
      </div>

      <div className="space-y-10">
        {[0, 1].map((groupIndex) => (
          <div key={groupIndex}>
            {/* Seed header skeleton */}
            <div className="flex items-end gap-4 mb-4">
              <div className="w-12 sm:w-14 md:w-16 aspect-[2/3] rounded-md animate-pulse bg-muted flex-shrink-0" />
              <div className="flex-1 pb-1 space-y-2">
                <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                <div className="h-5 w-44 animate-pulse rounded bg-muted" />
              </div>
            </div>

            {/* Sprocket skeleton */}
            <div className="flex items-center gap-[3px] mb-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="size-[5px] rounded-full animate-pulse bg-muted shrink-0"
                />
              ))}
              <div className="h-px flex-1 animate-pulse rounded bg-muted" />
            </div>

            {/* Cards skeleton */}
            <div className="flex gap-3 sm:gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] space-y-2"
                >
                  <div className="aspect-[2/3] rounded-lg animate-pulse bg-muted" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Suspense Wrapper ---

export function RecommendationsStripSuspense({ userId }: { userId: string }) {
  return <RecommendationsStrip userId={userId} />
}
