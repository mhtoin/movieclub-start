import { EmptyState } from '@/components/home/empty-state'
import { HeroSection } from '@/components/home/hero-section'
import { MovieReelSkeleton } from '@/components/home/movie-reel-skeleton'
import { RecommendationsSection } from '@/components/home/recommendations-section'
import { TrendingSection } from '@/components/home/trending-section'
import { homeQueries } from '@/lib/react-query/queries/home'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/_authenticated/home')({
  loader: async ({ context }) => {
    const userId = context.user?.userId
    // Hero content — await so it's ready before navigation completes
    await context.queryClient.ensureQueryData(movieQueries.latest())
    // Secondary sections — fire-and-forget, stream in while hero is visible
    context.queryClient.prefetchQuery(homeQueries.trending())
    context.queryClient.prefetchQuery(tmdbQueries.genres())
    if (userId) {
      context.queryClient.prefetchQuery(homeQueries.recommendations(userId))
    }
  },
  component: Home,
})

function Home() {
  const { user } = Route.useRouteContext()
  const { data: latestMovie } = useQuery(movieQueries.latest())

  if (!latestMovie) {
    return <EmptyState />
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <HeroSection movie={latestMovie.movie} movieUser={latestMovie.user} />

      <div className="relative space-y-0">
        <Suspense fallback={<MovieReelSkeleton />}>
          <TrendingSection />
        </Suspense>
        <Suspense fallback={<MovieReelSkeleton />}>
          <RecommendationsSection userId={user?.userId || ''} />
        </Suspense>
      </div>
    </div>
  )
}
