import { EmptyState } from '@/components/home/empty-state'
import { HeroSection } from '@/components/home/hero-section'
import { MovieReelSkeleton } from '@/components/home/movie-reel-skeleton'
import { RecommendationsSection } from '@/components/home/recommendations-section'
import { homeQueries } from '@/lib/react-query/queries/home'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/_authenticated/home')({
  loader: async ({ context }) => {
    const userId = context.user?.userId
    context.queryClient.prefetchQuery(movieQueries.latest())
    context.queryClient.prefetchQuery(tmdbQueries.genres())
    if (userId) {
      context.queryClient.prefetchQuery(homeQueries.recommendations(userId))
    }
  },
  component: Home,
})

function Home() {
  const { user } = Route.useRouteContext()
  const { data: latestMovie } = useSuspenseQuery(movieQueries.latest())

  if (!latestMovie) {
    return <EmptyState />
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <HeroSection movie={latestMovie.movie} />

      <div className="relative">
        <Suspense fallback={<MovieReelSkeleton />}>
          <RecommendationsSection userId={user?.userId || ''} />
        </Suspense>
      </div>
    </div>
  )
}
