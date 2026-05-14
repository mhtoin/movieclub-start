import { memo, useMemo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'

import { MarqueeHero } from './marquee-hero'
import { ShortlistStrip } from './shortlist-strip'
import { ClubSnapshot } from './club-snapshot'
import { HistoryStrip } from './history-strip'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
}

export const LandingPage = memo(function LandingPage({
  userId,
}: {
  userId: string
}) {
  const shouldReduceMotion = useReducedMotion()

  const { data: latestMovieData } = useSuspenseQuery(movieQueries.latest())
  const { data: userShortlist } = useSuspenseQuery(
    shortlistQueries.byUser(userId),
  )
  const { data: allShortlists = [] } = useSuspenseQuery(shortlistQueries.all())
  const { data: stats } = useSuspenseQuery(dashboardQueries.stats(userId))
  const { data: allWatched = [] } = useSuspenseQuery(movieQueries.allWatched())

  const latestMovie = latestMovieData?.movie ?? null
  const recentWatches = useMemo(() => allWatched.slice(0, 6), [allWatched])

  return (
    <div className="min-h-screen w-full pb-28 md:pb-16">
      <div className="relative md:pl-[72px] lg:pl-20 md:pr-10 lg:pr-16">
        <motion.div
          className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pt-6 md:pt-10 space-y-16 md:space-y-24"
          initial={shouldReduceMotion ? false : 'hidden'}
          animate="show"
          variants={containerVariants}
        >
          <motion.section variants={sectionVariants}>
            <MarqueeHero movie={latestMovie} userId={userId} />
          </motion.section>

          <motion.section variants={sectionVariants}>
            <ShortlistStrip shortlist={userShortlist} />
          </motion.section>

          <motion.section variants={sectionVariants}>
            <ClubSnapshot
              allShortlists={allShortlists}
              currentUserId={userId}
              stats={stats}
            />
          </motion.section>

          <motion.section variants={sectionVariants} className="pb-8">
            <HistoryStrip movies={recentWatches} />
          </motion.section>
        </motion.div>
      </div>
    </div>
  )
})

export function LandingSkeleton() {
  return (
    <div className="min-h-screen w-full pb-28 md:pb-16">
      <div className="relative md:pl-[72px] lg:pl-20 md:pr-10 lg:pr-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pt-6 md:pt-10 space-y-16 md:space-y-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-12 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
                <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
            <div className="aspect-[2/3] max-h-[480px] animate-pulse rounded-2xl bg-muted" />
          </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            <div className="lg:col-span-6 xl:col-span-7 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 animate-pulse rounded bg-muted" />
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="h-px flex-1 animate-pulse rounded bg-muted" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-xl border border-border/10 bg-muted/50"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 pr-0 sm:pr-4 border-r-0 sm:border-r-2 border-dashed border-border/20">
                    <div className="h-12 w-12 rounded-full animate-pulse bg-muted flex-shrink-0" />
                    <div className="hidden sm:block h-4 w-24 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="flex-1 flex items-center -gap-x-3 overflow-hidden">
                    {Array.from({ length: 5 }).map((_item, j) => (
                      <div
                        key={j}
                        className="h-20 w-12 sm:h-24 sm:w-14 md:h-28 md:w-[4.5rem] lg:h-32 lg:w-20 rounded-lg animate-pulse bg-muted flex-shrink-0 border-2 border-white/50"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-6 xl:col-span-5 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 animate-pulse rounded bg-muted" />
                <div className="h-5 w-28 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex h-20 animate-pulse rounded-xl bg-muted" />
              <div className="flex h-20 animate-pulse rounded-xl bg-muted" />
              <div className="grid grid-cols-2 gap-3 mt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-xl animate-pulse bg-muted border border-border/10"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
