import { createFileRoute } from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { Loader2, SlidersHorizontal, X } from 'lucide-react'
import { Suspense, useState } from 'react'
import { z } from 'zod'

import DiscoverMoviesList from '@/components/discover/discover-movie-list'
import { DiscoverFilters } from '@/components/discover/filters'
import { Button } from '@/components/ui/button'
import {
  DrawerClose,
  DrawerContent,
  DrawerHandle,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useMediaQuery } from '@/lib/hooks'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'

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
    ])
    context.queryClient.prefetchInfiniteQuery(
      tmdbQueries.discover({
        with_genres: deps.genres || undefined,
        with_watch_providers: deps.providers || undefined,
        'vote_average.gte': deps.minRating,
        'vote_average.lte': deps.maxRating,
        sort_by: deps.sortBy,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [totalResults, setTotalResults] = useState<number | null>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const selectedGenres = search.genres ? search.genres.split(',') : []
  const selectedProviders = search.providers ? search.providers.split('|') : []
  const voteRange: [number, number] = [search.minRating, search.maxRating]
  const sortBy = search.sortBy

  const handleGenresChange = (genres: Array<string>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        genres: genres.length > 0 ? genres.join(',') : '',
      }),
    })
  }

  const handleProvidersChange = (providers: Array<string>) => {
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

  const filtersContent = (
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
        totalResults={totalResults}
      />
    </Suspense>
  )

  return (
    <div className="h-full flex overflow-hidden">
      {!isDesktop && (
        <DrawerRoot open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DrawerPortal>
            <DrawerOverlay opacity="medium" />
            <DrawerContent className="p-6">
              <DrawerHandle />
              <div className="flex items-center justify-between mb-6">
                <DrawerTitle className="text-2xl font-bold">
                  Filters
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
              <div className="overflow-y-auto flex-1">{filtersContent}</div>
            </DrawerContent>
          </DrawerPortal>
        </DrawerRoot>
      )}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {!isDesktop && (
            <div className="px-4 py-2.5 flex items-center gap-3 border-b border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(true)}
                className="relative"
              >
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                Filters
                {(selectedGenres.length > 0 ||
                  selectedProviders.length > 0 ||
                  voteRange[0] !== 0 ||
                  voteRange[1] !== 10) && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full">
                    {selectedGenres.length +
                      selectedProviders.length +
                      (voteRange[0] !== 0 || voteRange[1] !== 10 ? 1 : 0)}
                  </span>
                )}
              </Button>
              {totalResults !== null && (
                <span className="text-xs text-muted-foreground/70 font-medium tabular-nums">
                  {totalResults.toLocaleString()} movies
                </span>
              )}
            </div>
          )}
          <div className="relative flex-1 flex flex-col overflow-hidden isolate">
            <div className="flex-shrink-0 px-4 pt-3 pb-1">
              {isDesktop && (
                <h1 className="text-lg font-semibold text-foreground/90 mb-2">
                  Discover
                </h1>
              )}
              {isDesktop && filtersContent}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24 pt-1 fade-mask fade-y-10 fade-intensity-75 dark:fade-y-16 dark:fade-intensity-100">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                }
              >
                <DiscoverMoviesList onTotalResults={setTotalResults} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
