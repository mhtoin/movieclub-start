import { Suspense, memo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion'

import { HeroSkeleton, MarqueeHero } from './marquee-hero'
import {
  ShortlistStripSkeleton,
  ShortlistStripSuspense,
} from './shortlist-strip'
import { ClubSnapshotSkeleton, ClubSnapshotSuspense } from './club-snapshot'
import {
  RecommendationsStripSkeleton,
  RecommendationsStripSuspense,
} from './recommendations-strip'
import { HistoryStripSkeleton, HistoryStripSuspense } from './history-strip'
import { movieQueries } from '@/lib/react-query/queries/movies'

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
  const latestMovie = latestMovieData?.movie ?? null

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen w-full pb-28 md:pb-16">
        <div className="relative md:pl-[72px] lg:pl-20 md:pr-10 lg:pr-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pt-6 md:pt-10 space-y-16 md:space-y-24">
            <m.section
              initial={shouldReduceMotion ? false : 'hidden'}
              animate="show"
              variants={sectionVariants}
            >
              <MarqueeHero movie={latestMovie} userId={userId} />
            </m.section>

            <Suspense fallback={<ShortlistStripSkeleton />}>
              <m.section
                initial={shouldReduceMotion ? false : 'hidden'}
                animate="show"
                variants={sectionVariants}
              >
                <ShortlistStripSuspense userId={userId} />
              </m.section>
            </Suspense>

            <Suspense fallback={<ClubSnapshotSkeleton />}>
              <m.section
                initial={shouldReduceMotion ? false : 'hidden'}
                animate="show"
                variants={sectionVariants}
              >
                <ClubSnapshotSuspense userId={userId} />
              </m.section>
            </Suspense>

            <Suspense fallback={<RecommendationsStripSkeleton />}>
              <m.section
                initial={shouldReduceMotion ? false : 'hidden'}
                animate="show"
                variants={sectionVariants}
              >
                <RecommendationsStripSuspense userId={userId} />
              </m.section>
            </Suspense>

            <Suspense fallback={<HistoryStripSkeleton />}>
              <m.section
                initial={shouldReduceMotion ? false : 'hidden'}
                animate="show"
                variants={sectionVariants}
                className="pb-8"
              >
                <HistoryStripSuspense />
              </m.section>
            </Suspense>
          </div>
        </div>
      </div>
    </LazyMotion>
  )
})

export function LandingSkeleton() {
  return (
    <div className="min-h-screen w-full pb-28 md:pb-16">
      <div className="relative md:pl-[72px] lg:pl-20 md:pr-10 lg:pr-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pt-6 md:pt-10 space-y-16 md:space-y-24">
          <HeroSkeleton />
          <ShortlistStripSkeleton />
          <ClubSnapshotSkeleton />
          <RecommendationsStripSkeleton />
          <HistoryStripSkeleton />
        </div>
      </div>
    </div>
  )
}
