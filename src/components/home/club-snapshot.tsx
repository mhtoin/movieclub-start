import { memo, useEffect, useRef } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { m, useInView, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Clock,
  Film,
  Star,
  Ticket,
  Trophy,
  Users,
} from 'lucide-react'
import type { ShortlistWithUserMovies } from '@/db/schema'
import type { DashboardStats } from '@/lib/react-query/queries/dashboard'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import Avatar from '@/components/ui/avatar'

interface ClubSnapshotProps {
  allShortlists: Array<ShortlistWithUserMovies>
  currentUserId: string
  stats: DashboardStats | undefined
}

function getUserTierlistHref(userId: string): string {
  return `/tierlist/${userId}`
}

function AnimatedCounter({
  value,
  decimals = 0,
}: {
  value: number
  decimals?: number
}) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || !ref.current || hasAnimated.current) return
    hasAnimated.current = true

    if (shouldReduceMotion) {
      ref.current.textContent =
        decimals > 0 ? value.toFixed(decimals) : String(Math.round(value))
      return
    }

    let raf: number
    const duration = 1200
    const start = performance.now()
    const from = 0
    const to = value

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = from + (to - from) * eased
      if (ref.current) {
        ref.current.textContent =
          decimals > 0 ? current.toFixed(decimals) : String(Math.round(current))
      }
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isInView, value, decimals, shouldReduceMotion])

  return (
    <span ref={ref} className="tabular-nums">
      {decimals > 0 ? value.toFixed(decimals) : Math.round(value)}
    </span>
  )
}

export const ClubSnapshot = memo(function ClubSnapshot({
  allShortlists,
  currentUserId,
  stats,
}: ClubSnapshotProps) {
  const shouldReduceMotion = useReducedMotion()
  const otherShortlists = allShortlists.filter(
    (s) => s.user.id !== currentUserId,
  )
  const totalMovies = allShortlists.reduce((acc, s) => acc + s.movies.length, 0)

  return (
    <div>
      <div className="mb-7 flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-primary">
            <Users className="size-4" aria-hidden="true" />
            <span className="font-cinema-caps text-sm tracking-[0.18em] uppercase leading-none">
              The Club
            </span>
          </div>
          <h2 className="font-cinema text-2xl tracking-wide text-foreground md:text-3xl">
            What everyone is lining up
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A quick look at the club&apos;s current picks.
          </p>
        </div>
        <Link
          to="/shortlists"
          className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition-colors duration-150 ease-out hover:text-primary/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Browse all picks
          <ArrowRight className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-1" />
        </Link>
      </div>

      {otherShortlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 rounded-2xl border-2 border-dashed border-border/30 bg-muted/10">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Users className="size-7 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            No other members have shortlists yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherShortlists.slice(0, 4).map((shortlist, index) => (
              <m.div
                key={shortlist.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.36,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="transition-transform duration-200 ease-out fine-hover:hover:-translate-y-1"
              >
                <div
                  className="ticket-card group flex items-center gap-3 rounded-xl py-3.5 pl-3 pr-3.5
                   bg-[color-mix(in_oklch,var(--card)_96%,var(--primary)_4%)]
                   border border-[color-mix(in_oklch,var(--border)_90%,var(--primary)_10%)]
                   transition-[border-color,box-shadow] duration-200 ease-out
                   fine-hover:group-hover:border-primary/30"
                  style={{
                    boxShadow:
                      '0 1px 3px rgba(0,0,0,0.03), 0 4px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Ticket punch holes — vertical */}
                  <div className="ml-2 flex flex-shrink-0 flex-col gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2.5 rounded-[3px]
                        bg-[color-mix(in_oklch,var(--card)_40%,black)]
                        shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]
                        dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),0_1px_0_rgba(255,255,255,0.04)]"
                      />
                    ))}
                  </div>

                  {/* Avatar + name */}
                  <Avatar
                    src={shortlist.user.image}
                    alt={shortlist.user.name}
                    name={shortlist.user.name}
                    size={44}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-foreground truncate">
                        {shortlist.user.name}
                      </span>
                      {shortlist.isReady && shortlist.participating && (
                        <span className="inline-flex items-center bg-[color-mix(in_oklch,var(--warning)_85%,var(--primary)_15%)] text-[color-mix(in_oklch,var(--warning-foreground)_90%,var(--foreground)_10%)] px-1.5 py-0.5 text-[10px] tracking-wider uppercase font-bold animate-stamp -rotate-3 shadow-sm flex-shrink-0">
                          Ready
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground/60">
                      {shortlist.movies.length}{' '}
                      {shortlist.movies.length === 1 ? 'pick' : 'picks'}
                    </p>
                  </div>

                  {/* Mini poster stack */}
                  <div className="flex items-center -space-x-2 flex-shrink-0">
                    {shortlist.movies.slice(0, 3).map((movie) => {
                      const posterPath =
                        (movie.images as any)?.posters?.[0]?.file_path ?? null
                      const posterUrl = posterPath
                        ? `https://image.tmdb.org/t/p/w154${posterPath}`
                        : null

                      return (
                        <Link
                          to="/watched/$movieId"
                          params={{ movieId: movie.id }}
                          key={movie.id}
                          aria-label={`Open ${movie.title}`}
                          className="relative h-20 w-12 flex-shrink-0 cursor-pointer rounded-sm border border-white/60 bg-muted shadow-sm
                            transition-[transform,z-index,box-shadow] duration-200 ease-out fine-hover:hover:z-10 fine-hover:hover:scale-125 fine-hover:hover:-translate-y-1 fine-hover:hover:shadow-md
                            md:h-24 md:w-16"
                          title={movie.title}
                        >
                          {posterUrl ? (
                            <img
                              src={posterUrl}
                              alt={movie.title}
                              className="h-full w-full object-cover rounded-sm"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Ticket className="size-4 text-muted-foreground/25" />
                            </div>
                          )}
                        </Link>
                      )
                    })}
                    {shortlist.movies.length > 3 && (
                      <div className="relative z-10 flex h-20 w-12 flex-shrink-0 items-center justify-center rounded-sm border border-white/60 bg-muted/80 shadow-sm md:h-24 md:w-16">
                        <span className="text-sm font-bold text-muted-foreground">
                          +{shortlist.movies.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </m.div>
            ))}
          </div>

          {otherShortlists.length > 4 && (
            <m.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4"
            >
              <Link
                to="/shortlists"
                className="group inline-flex items-center gap-2 pl-2 text-sm font-semibold text-primary transition-colors duration-150 ease-out hover:text-primary/80"
              >
                View all {otherShortlists.length} members
                <ArrowRight className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-1" />
              </Link>
            </m.div>
          )}
        </>
      )}

      {/* Compact stats bar */}
      {stats && (
        <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-border/60 pt-5 sm:gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
            <Film className="size-3.5 text-muted-foreground/45" />
            <span className="text-xs text-muted-foreground/70">Watched</span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              <AnimatedCounter value={stats.totalWatchedMovies} />
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
            <Clock className="size-3.5 text-muted-foreground/45" />
            <span className="text-xs text-muted-foreground/70">Hours</span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              <AnimatedCounter value={Math.round(stats.totalWatchTime / 60)} />
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
            <Users className="size-3.5 text-muted-foreground/45" />
            <span className="text-xs text-muted-foreground/70">In Raffle</span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              <AnimatedCounter value={totalMovies} />
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
            <Star className="size-3.5 text-muted-foreground/45" />
            <span className="text-xs text-muted-foreground/70">Avg Rating</span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              <AnimatedCounter value={stats.averageRating} decimals={1} />
            </span>
          </div>

          <Link
            to={getUserTierlistHref(currentUserId)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent/60 hover:text-foreground sm:ml-auto"
          >
            <Trophy className="size-3.5" />
            Rank movies
            <ArrowRight className="size-3" />
          </Link>
        </div>
      )}
    </div>
  )
})

export function ClubSnapshotSkeleton() {
  return (
    <div>
      <div className="mb-7 flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-full animate-pulse bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_skeleton, skeletonIndex) => (
          <div
            key={skeletonIndex}
            className="flex items-center gap-4 px-3 py-4 rounded-xl border border-border/10 bg-muted/30"
          >
            <div className="ml-2 flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_hole, holeIndex) => (
                <div
                  key={holeIndex}
                  className="w-2 h-2.5 rounded-[3px] animate-pulse bg-muted"
                />
              ))}
            </div>
            <div className="size-12 rounded-full animate-pulse bg-muted flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex items-center -space-x-2">
              {Array.from({ length: 3 }).map((_poster, posterIndex) => (
                <div
                  key={posterIndex}
                  className="h-20 w-12 flex-shrink-0 animate-pulse rounded-sm border border-white/50 bg-muted md:h-24 md:w-16"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex h-16 animate-pulse rounded-2xl bg-muted/50 border border-border/10" />
      <div className="mt-8 flex items-center gap-2 sm:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-28 rounded-lg animate-pulse bg-muted/50 border border-border/10"
          />
        ))}
      </div>
    </div>
  )
}

export function ClubSnapshotSuspense({ userId }: { userId: string }) {
  const { data: allShortlists = [] } = useSuspenseQuery(shortlistQueries.all())
  const { data: stats } = useSuspenseQuery(dashboardQueries.stats(userId))
  return (
    <ClubSnapshot
      allShortlists={allShortlists}
      currentUserId={userId}
      stats={stats}
    />
  )
}
