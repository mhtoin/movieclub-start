import { memo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import '@/styles/polaroid.css'
import { Link } from '@tanstack/react-router'
import { m, useReducedMotion } from 'framer-motion'
import { Clapperboard, Clock, Plus, Star, Ticket } from 'lucide-react'
import type { Shortlist } from '@/db/schema/shortlists'
import type { MovieWithCredits } from '@/db/schema/movies'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'

type ShortlistWithMovies = Shortlist & {
  movies: Array<MovieWithCredits>
}

interface ShortlistStripProps {
  shortlist: ShortlistWithMovies | null
}

const ROTATIONS = [-2.5, 1.8, -1.2, 3.0, -0.8, 2.2, -3.0, 1.5, -1.8, 2.8]

function Clothespin() {
  return (
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-[2px] z-20 pointer-events-none">
      <div
        className="w-[5px] h-4 rounded-sm shadow-sm -rotate-6 origin-bottom"
        style={{
          background:
            'color-mix(in oklch, var(--muted-foreground) 70%, var(--primary) 30%)',
        }}
      />
      <div
        className="w-[5px] h-4 rounded-sm shadow-sm rotate-6 origin-bottom"
        style={{
          background:
            'color-mix(in oklch, var(--muted-foreground) 70%, var(--primary) 30%)',
        }}
      />
    </div>
  )
}

function PolaroidBack({ movie }: { movie: MovieWithCredits }) {
  const crewArray = Array.isArray(movie.crew) ? movie.crew : []
  const foundDirector = crewArray.find((c: any) => c.job === 'Director')
  const director = foundDirector != null ? (foundDirector.name ?? null) : null

  const castArray = Array.isArray(movie.cast) ? movie.cast : []
  const topCast = castArray
    .slice(0, 3)
    .flatMap((c: any) => (c.name ? [c.name] : []))

  const genres = movie.genres ?? []
  const runtime = movie.runtime
  const rating = movie.voteAverage
  const hasTagline = !!movie.tagline?.trim()
  const snippet =
    movie.tagline?.trim() || movie.overview.slice(0, 72).trim() || null

  return (
    <div className="polaroid-back absolute inset-0 bg-[#f5f0e8] dark:bg-[#e8e0d0] rounded-sm shadow-md transition-shadow duration-300 group-hover:shadow-2xl">
      <div className="polaroid-back-content w-40 sm:w-48 md:w-56 lg:w-64 pt-2.5 px-2.5 pb-10">
        <div className="aspect-[2/3] flex flex-col gap-3 p-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="size-3 text-amber-600 fill-amber-500" />
              <span className="text-sm font-bold text-black/80">
                {rating > 0 ? rating.toFixed(1) : '—'}
              </span>
            </div>
            {runtime && runtime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="size-3 text-black/30" />
                <span className="text-[10px] text-black/50 font-medium">
                  {Math.floor(runtime / 60)}h {runtime % 60}m
                </span>
              </div>
            )}
          </div>

          {director && (
            <div>
              <p className="text-[9px] font-cinema-caps tracking-wider uppercase text-black/40">
                Directed by
              </p>
              <p className="text-xs font-semibold text-black/80 leading-tight mt-0.5">
                {director}
              </p>
            </div>
          )}

          {topCast.length > 0 && (
            <div>
              <p className="text-[9px] font-cinema-caps tracking-wider uppercase text-black/40">
                Starring
              </p>
              <div className="mt-0.5 space-y-0.5">
                {topCast.map((name) => (
                  <p
                    key={name}
                    className="text-[11px] text-black/70 leading-snug"
                  >
                    {name}
                  </p>
                ))}
              </div>
            </div>
          )}

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="text-[9px] px-1.5 py-0.5 bg-black/10 rounded-sm text-black/50 font-medium"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {snippet && (
            <p className="text-[10px] italic text-black/45 leading-snug line-clamp-3">
              {hasTagline
                ? `"${snippet}"`
                : `${snippet}${snippet.length >= 72 ? '...' : ''}`}
            </p>
          )}
        </div>

        <div className="mt-2.5 text-center px-1">
          <p className="text-[9px] font-cinema-caps tracking-wider uppercase text-black/25">
            {movie.title}
          </p>
        </div>
      </div>
    </div>
  )
}

export const ShortlistStrip = memo(function ShortlistStrip({
  shortlist,
}: ShortlistStripProps) {
  const shouldReduceMotion = useReducedMotion()
  const movies = shortlist?.movies ?? []

  if (movies.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 bg-primary" />
          <Clapperboard className="size-4 text-primary flex-shrink-0" />
          <span className="font-cinema-caps text-sm md:text-base tracking-[0.15em] text-primary uppercase">
            Your Shortlist
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
        </div>

        <div
          className="relative overflow-x-auto pb-6 pt-8 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 no-scrollbar"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, transparent 28px, var(--border) 28px, var(--border) 29px, transparent 29px)',
          }}
        >
          <div className="flex gap-6 md:gap-8">
            <m.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 16, rotate: 0 }
              }
              animate={{ opacity: 1, y: 0, rotate: 0.5 }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotate: -2,
                      scale: 1.02,
                      transition: {
                        type: 'spring',
                        stiffness: 200,
                        damping: 10,
                      },
                    }
              }
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex-shrink-0 cursor-pointer"
              style={{ transformOrigin: 'top center' }}
            >
              <Clothespin />
              <div className="w-44 sm:w-48 pt-2.5 px-2.5 pb-10 rounded-sm shadow-md transition-shadow duration-300 hover:shadow-xl bg-[color-mix(in_oklch,white_95%,var(--primary)_5%)]">
                <div className="aspect-[2/3] flex flex-col items-center justify-center gap-3 bg-black/5 rounded-[1px]">
                  <Ticket className="size-10 text-black/20" />
                  <p className="text-xs text-[color-mix(in_oklch,black_70%,var(--primary)_30%)] font-medium">
                    Empty
                  </p>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-[11px] text-[color-mix(in_oklch,black_60%,var(--primary)_40%)]">
                    Find movies for the raffle
                  </p>
                </div>
              </div>
            </m.div>

            <m.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 16, rotate: 0 }
              }
              animate={{ opacity: 1, y: 0, rotate: -1.5 }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotate: 2.5,
                      scale: 1.02,
                      transition: {
                        type: 'spring',
                        stiffness: 200,
                        damping: 10,
                      },
                    }
              }
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative flex-shrink-0"
              style={{ transformOrigin: 'top center' }}
            >
              <Clothespin />
              <Link
                to="/discover"
                className="block w-44 sm:w-48 pt-2.5 px-2.5 pb-10 rounded-sm shadow-md transition-shadow duration-300 hover:shadow-xl bg-[color-mix(in_oklch,white_95%,var(--primary)_5%)]"
              >
                <div className="aspect-[2/3] flex flex-col items-center justify-center gap-2 bg-black/5 rounded-[1px] border-2 border-dashed border-black/15">
                  <Plus className="size-8 text-[color-mix(in_oklch,black_50%,var(--primary)_50%)]" />
                  <span className="font-cinema-caps text-xs tracking-wider uppercase text-[color-mix(in_oklch,black_50%,var(--primary)_50%)]">
                    Discover
                  </span>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-[11px] text-[color-mix(in_oklch,black_60%,var(--primary)_40%)]">
                    Add your first pick
                  </p>
                </div>
              </Link>
            </m.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-primary" />
          <Clapperboard className="size-4 text-primary flex-shrink-0" />
          <span className="font-cinema-caps text-sm md:text-base tracking-[0.15em] text-primary uppercase">
            Your Shortlist
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
          </span>
        </div>
        {movies.length < 3 && (
          <Link
            to="/discover"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="size-3.5" />
            Add more
          </Link>
        )}
      </div>

      <div
        className="relative overflow-x-auto pb-8 pt-10 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 no-scrollbar snap-x snap-mandatory"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, transparent 30px, var(--border) 30px, var(--border) 31px, transparent 31px)',
        }}
      >
        <div className="flex gap-6 md:gap-8">
          {movies.map((movie, index) => {
            const posterPath =
              (movie.images as any)?.posters?.[0]?.file_path ?? null
            const posterUrl = posterPath
              ? `https://image.tmdb.org/t/p/w342${posterPath}`
              : null
            const year = movie.releaseDate
              ? new Date(movie.releaseDate).getFullYear()
              : null
            const rotation = ROTATIONS[index % ROTATIONS.length]

            return (
              <div
                key={movie.id}
                suppressHydrationWarning
                className="snap-start flex-shrink-0 relative group cursor-pointer hover:z-50 focus-within:z-50"
                style={
                  {
                    transformOrigin: 'top center',
                    '--rotation': `${rotation}deg`,
                    opacity: 0,
                    animation: shouldReduceMotion
                      ? 'none'
                      : `fadeInRotate 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.07}s forwards`,
                  } as React.CSSProperties
                }
              >
                <Clothespin />
                <div className="polaroid-flip-container">
                  <div className="polaroid-flipper">
                    <div className="polaroid-front">
                      <div className="w-40 sm:w-48 md:w-56 lg:w-64 pt-2.5 px-2.5 pb-10 rounded-sm shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1 bg-[color-mix(in_oklch,white_95%,var(--primary)_5%)]">
                        <div className="aspect-[2/3] overflow-hidden rounded-[1px] bg-black/5">
                          {posterUrl ? (
                            <img
                              src={posterUrl}
                              alt={movie.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Ticket className="size-8 text-black/20" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2.5 text-center px-1">
                          <p className="text-xs font-semibold text-[color-mix(in_oklch,black_85%,var(--primary)_15%)] line-clamp-1 leading-tight">
                            {movie.title}
                          </p>
                          {year && (
                            <p className="text-[10px] text-[color-mix(in_oklch,black_55%,var(--primary)_45%)] mt-1 font-medium">
                              {year}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <PolaroidBack movie={movie} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})

export function ShortlistStripSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-8 animate-pulse rounded bg-muted" />
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-px flex-1 animate-pulse rounded bg-muted" />
      </div>
      <div
        className="flex gap-6 md:gap-8 overflow-hidden pb-8 pt-10"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, transparent 30px, var(--border) 30px, var(--border) 31px, transparent 31px)',
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-40 sm:w-48 flex-shrink-0 pt-2.5 px-2.5 pb-10 rounded-sm animate-pulse bg-muted"
            style={{
              transform: `rotate(${[-2.5, 1.8, -1.2, 3.0, -0.8][i]}deg)`,
            }}
          >
            <div className="aspect-[2/3] rounded-[1px] bg-muted-foreground/10" />
            <div className="mt-2.5 h-3 w-20 mx-auto rounded bg-muted-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ShortlistStripSuspense({ userId }: { userId: string }) {
  const { data: shortlist } = useSuspenseQuery(shortlistQueries.byUser(userId))
  return <ShortlistStrip shortlist={shortlist} />
}
