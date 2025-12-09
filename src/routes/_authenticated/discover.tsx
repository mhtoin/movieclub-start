import DiscoverMoviesList from '@/components/discover/discover-movie-list'
import { DiscoverFilters } from '@/components/discover/filters'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { createFileRoute } from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { z } from 'zod'

const discoverSearchSchema = z.object({
  genres: fallback(z.string(), '').default(''),
  providers: fallback(z.string(), '').default('8|323|463|496'),
  minRating: fallback(z.number(), 0).default(0),
  maxRating: fallback(z.number(), 10).default(10),
  sortBy: fallback(z.string(), 'popularity.desc').default('popularity.desc'),
})

export const Route = createFileRoute('/_authenticated/discover')({
  validateSearch: zodValidator(discoverSearchSchema),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(tmdbQueries.genres()),
      context.queryClient.ensureQueryData(tmdbQueries.watchProviders()),
      context.queryClient.ensureInfiniteQueryData(
        tmdbQueries.discover({
          with_genres: deps.genres || undefined,
          with_watch_providers: deps.providers || undefined,
          'vote_average.gte': deps.minRating,
          'vote_average.lte': deps.maxRating,
          sort_by: deps.sortBy,
        }),
      ),
    ])
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const selectedGenres = search.genres ? search.genres.split(',') : []
  const selectedProviders = search.providers ? search.providers.split('|') : []
  const voteRange: [number, number] = [search.minRating, search.maxRating]
  const sortBy = search.sortBy

  const handleGenresChange = (genres: string[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        genres: genres.length > 0 ? genres.join(',') : '',
      }),
    })
  }

  const handleProvidersChange = (providers: string[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        providers: providers.length > 0 ? providers.join('|') : '',
      }),
    })
  }

  const handleVoteRangeChange = (range: [number, number]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        minRating: range[0],
        maxRating: range[1],
      }),
    })
  }

  const handleSortByChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        sortBy: value,
      }),
    })
  }

  return (
    <div className="h-full flex overflow-hidden">
      <aside className="w-80 flex-shrink-0 border-r border-border bg-sidebar p-6 overflow-y-auto">
        <div className="sticky top-0">
          <h2 className="mb-6 text-2xl font-bold">Filters</h2>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            }
          >
            <DiscoverFilters
              selectedGenres={selectedGenres}
              onGenresChange={handleGenresChange}
              selectedProviders={selectedProviders}
              onProvidersChange={handleProvidersChange}
              voteRange={voteRange}
              onVoteRangeChange={handleVoteRangeChange}
              sortBy={sortBy}
              onSortByChange={handleSortByChange}
            />
          </Suspense>
        </div>
      </aside>
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="relative flex-1 overflow-hidden isolate">
            <div className="h-full overflow-y-auto px-6 py-6 pt-6 fade-mask fade-left-40 fade-y-16 dark:fade-y-40 fade-intensity-100">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                }
              >
                <DiscoverMoviesList />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
