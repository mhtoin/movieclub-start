import { EmptyState } from '@/components/home/empty-state'
import { HeroSection } from '@/components/home/hero-section'
import { homeQueries } from '@/lib/react-query/queries/home'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/home')({
  loader: async ({ context }) => {
    const userId = context.user?.userId
    await Promise.all([
      context.queryClient.ensureQueryData(movieQueries.latest()),
      context.queryClient.ensureQueryData(homeQueries.trending()),
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

      <div className="relative space-y-0"></div>
    </div>
  )
}
