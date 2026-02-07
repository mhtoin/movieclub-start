import { EmptyState } from '@/components/home/empty-state'
import { HeroSection } from '@/components/home/hero-section'
import { MovieReel } from '@/components/home/movie-reel'
import { homeQueries, type TMDBMovie } from '@/lib/react-query/queries/home'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Flame, ThumbsUp } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/home')({
  loader: async ({ context }) => {
    const userId = context.user?.userId
    await Promise.all([
      context.queryClient.ensureQueryData(movieQueries.latest()),
      context.queryClient.ensureQueryData(homeQueries.trending()),
      context.queryClient.ensureQueryData(tmdbQueries.genres()),
      userId
        ? context.queryClient.ensureQueryData(
            homeQueries.recommendations(userId),
          )
        : Promise.resolve(),
    ])
  },
  component: Home,
})

function Home() {
  const { user } = Route.useRouteContext()
  const { data: latestMovie } = useSuspenseQuery(movieQueries.latest())
  const { data: trendingMovies } = useQuery(homeQueries.trending())
  const { data: recommendations } = useQuery(
    homeQueries.recommendations(user?.userId || ''),
  )

  if (!latestMovie) {
    return <EmptyState />
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <HeroSection movie={latestMovie.movie} movieUser={latestMovie.user} />

      <div className="relative space-y-0">
        {trendingMovies && trendingMovies.length > 0 && (
          <MovieReel
            title="Trending Now"
            subtitle="Popular on your streaming services"
            icon={<Flame className="h-5 w-5" />}
            movies={trendingMovies as TMDBMovie[]}
            accentColor="orange"
          />
        )}
        {recommendations && recommendations.length > 0 && (
          <MovieReel
            title="Recommended"
            subtitle="Based on your highly ranked films"
            icon={<ThumbsUp className="h-5 w-5" />}
            movies={recommendations as TMDBMovie[]}
            accentColor="blue"
          />
        )}
      </div>
    </div>
  )
}
