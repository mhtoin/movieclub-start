import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Clock,
  Dices,
  Film,
  Star,
  Ticket,
  Trophy,
  Users,
} from 'lucide-react'
import type { ShortlistWithUserMovies } from '@/db/schema'
import type { DashboardStats } from '@/lib/react-query/queries/dashboard'
import Avatar from '@/components/ui/avatar'

interface ClubSnapshotProps {
  allShortlists: Array<ShortlistWithUserMovies>
  currentUserId: string
  stats: DashboardStats | undefined
}

function getUserTierlistHref(userId: string): string {
  return `/tierlist/${userId}`
}

const ROTATIONS = [0.5, -0.7, 0.4, -0.6]

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
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    if (shouldReduceMotion) {
      setDisplay(value)
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
      setDisplay(from + (to - from) * eased)
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isInView, value, shouldReduceMotion])

  return (
    <span ref={ref} className="tabular-nums">
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
    </span>
  )
}

export function ClubSnapshot({
  allShortlists,
  currentUserId,
  stats,
}: ClubSnapshotProps) {
  const shouldReduceMotion = useReducedMotion()
  const otherShortlists = allShortlists.filter(
    (s) => s.user.id !== currentUserId
  )
  const totalMovies = allShortlists.reduce((acc, s) => acc + s.movies.length, 0)
  const readyCount = allShortlists.filter(
    (s) => s.isReady && s.participating
  ).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
      <div className="lg:col-span-6 xl:col-span-7">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8 bg-primary" />
          <Ticket className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="font-cinema-caps text-sm md:text-base tracking-[0.15em] text-primary uppercase">
            The Club
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
        </div>

        {otherShortlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 rounded-2xl border-2 border-dashed border-border/30 bg-muted/10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              No other members have shortlists yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {otherShortlists.slice(0, 4).map((shortlist, index) => (
              <motion.div
                key={shortlist.id}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, x: -24, rotate: 0 }
                }
                animate={{
                  opacity: 1,
                  x: 0,
                  rotate: ROTATIONS[index] ?? 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="transition-all duration-300 hover:-translate-y-1.5"
                style={{
                  filter:
                    'drop-shadow(0 2px 4px rgba(0,0,0,0.04)) drop-shadow(0 8px 16px rgba(0,0,0,0.03))',
                }}
              >
                <div
                  className="ticket-card group flex items-center gap-3 sm:gap-5 pl-5 sm:pl-7 pr-4 sm:pr-6 py-4 sm:py-5 rounded-xl
                  bg-[color-mix(in_oklch,var(--card)_92%,var(--primary)_8%)]
                  border border-[color-mix(in_oklch,var(--border)_80%,var(--primary)_20%)]"
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 md:gap-4 pr-0 sm:pr-4 md:pr-6 border-r-0 sm:border-r-[3px] border-dashed border-border min-w-[4rem] sm:min-w-0">
                    <div className="hidden lg:flex flex-col gap-2.5 mr-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2.5 rounded-[3px]
                          bg-[color-mix(in_oklch,var(--card)_40%,black)]
                          shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]
                          dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),0_1px_0_rgba(255,255,255,0.04)]"
                        />
                      ))}
                    </div>

                    <Avatar
                      src={shortlist.user.image ?? ''}
                      alt={shortlist.user.name ?? ''}
                      name={shortlist.user.name ?? 'User'}
                      size={48}
                    />

                    <div className="text-center sm:text-left min-w-0">
                      <span className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate block max-w-[8rem] sm:max-w-[10rem]">
                        {shortlist.user.name}
                      </span>
                      {shortlist.isReady && shortlist.participating && (
                        <span className="inline-flex items-center mt-1 sm:mt-1.5 bg-[color-mix(in_oklch,var(--warning)_85%,var(--primary)_15%)] text-[color-mix(in_oklch,var(--warning-foreground)_90%,var(--foreground)_10%)] px-2.5 py-1 text-[11px] tracking-wider uppercase font-bold animate-stamp -rotate-3 origin-top-left shadow-sm">
                          Ready
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex items-center -space-x-3 py-1">
                    {shortlist.movies.slice(0, 5).map((movie, mIndex) => {
                      const posterPath =
                        (movie.images as any)?.posters?.[0]?.file_path ?? null
                      const posterUrl = posterPath
                        ? `https://image.tmdb.org/t/p/w154${posterPath}`
                        : null

                      return (
                        <div
                          key={movie.id}
                          className="relative h-20 w-12 sm:h-24 sm:w-14 md:h-28 md:w-[4.5rem] lg:h-32 lg:w-20 flex-shrink-0 rounded-md bg-muted
                          border-2 border-white/70 dark:border-white/10 shadow-sm
                          transition-all duration-300 hover:z-10 hover:scale-110 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
                          style={{ zIndex: shortlist.movies.length - mIndex }}
                          title={movie.title}
                        >
                          {posterUrl ? (
                            <img
                              src={posterUrl}
                              alt={movie.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Ticket className="h-5 w-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {shortlist.movies.length > 5 && (
                      <div
                        className="relative z-10 flex h-20 w-12 sm:h-24 sm:w-14 md:h-28 md:w-[4.5rem] lg:h-32 lg:w-20 flex-shrink-0 items-center justify-center rounded-md
                        bg-muted/90 dark:bg-muted/80 border-2 border-white/70 dark:border-white/10 backdrop-blur-sm
                        text-xs font-bold text-muted-foreground shadow-sm"
                      >
                        +{shortlist.movies.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {otherShortlists.length > 4 && (
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to="/shortlists"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors pl-2"
                >
                  View all {otherShortlists.length} members
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="lg:col-span-6 xl:col-span-5">
        <div className="mb-6">
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Quick Actions
          </span>
        </div>

        <div className="space-y-4">
          <Link
            to="/raffle"
            className="group flex items-stretch rounded-xl overflow-hidden border-2 border-primary/20 bg-[color-mix(in_oklch,var(--card)_95%,var(--primary)_5%)] transition-all
            hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-center justify-center w-20 flex-shrink-0 bg-primary/15 transition-all duration-300 group-hover:bg-primary/25">
              <motion.div
                className="text-primary"
                whileHover={shouldReduceMotion ? undefined : { rotate: 25 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              >
                <Dices className="h-7 w-7" />
              </motion.div>
            </div>
            <div className="flex-1 flex items-center justify-between p-5 min-w-0">
              <div>
                <p className="text-base font-bold text-foreground">
                  Run the Raffle
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {readyCount} of {allShortlists.length} members ready
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary transition-all group-hover:translate-x-1 flex-shrink-0 ml-3" />
            </div>
          </Link>

          <Link
            to={getUserTierlistHref(currentUserId)}
            className="group flex items-stretch rounded-xl overflow-hidden border border-border/20 bg-card/40 transition-all
            hover:border-border/40 hover:bg-card/60"
          >
            <div className="flex items-center justify-center w-16 flex-shrink-0 bg-muted/50 transition-all duration-300 group-hover:bg-muted">
              <motion.div
                className="text-muted-foreground"
                whileHover={shouldReduceMotion ? undefined : { rotate: -15 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              >
                <Trophy className="h-5 w-5" />
              </motion.div>
            </div>
            <div className="flex-1 flex items-center justify-between p-4 min-w-0">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Rank Movies
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  Update your tierlists
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-all group-hover:translate-x-1 group-hover:text-muted-foreground flex-shrink-0 ml-3" />
            </div>
          </Link>
        </div>

        {stats && (
          <div className="mt-10">
            <div className="mb-5">
              <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                Club Stats
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-card/60 border border-border/10 p-4 transition-colors hover:bg-card/80">
                <div className="flex items-center gap-2 mb-3">
                  <Film className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Watched
                  </span>
                </div>
                <p className="font-cinema text-3xl md:text-4xl font-bold text-foreground leading-none">
                  <AnimatedCounter value={stats.totalWatchedMovies} />
                </p>
              </div>
              <div className="rounded-xl bg-card/60 border border-border/10 p-4 transition-colors hover:bg-card/80">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Hours
                  </span>
                </div>
                <p className="font-cinema text-3xl md:text-4xl font-bold text-foreground leading-none">
                  <AnimatedCounter value={Math.round(stats.totalWatchTime / 60)} />
                </p>
              </div>
              <div className="rounded-xl bg-card/60 border border-border/10 p-4 transition-colors hover:bg-card/80">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    In Raffle
                  </span>
                </div>
                <p className="font-cinema text-3xl md:text-4xl font-bold text-foreground leading-none">
                  <AnimatedCounter value={totalMovies} />
                </p>
              </div>
              <div className="rounded-xl bg-card/60 border border-border/10 p-4 transition-colors hover:bg-card/80">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Avg Rating
                  </span>
                </div>
                <p className="font-cinema text-3xl md:text-4xl font-bold text-foreground leading-none">
                  <AnimatedCounter value={stats.averageRating} decimals={1} />
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
