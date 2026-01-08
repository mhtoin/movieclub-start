import { createFileRoute } from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { Loader2, SlidersHorizontal, X } from 'lucide-react'
import { Suspense, useState } from 'react'
import { z } from 'zod'

import DiscoverMoviesList from '@/components/discover/discover-movie-list'
import { DiscoverFilters } from '@/components/discover/filters'
import { PageTitleBar } from '@/components/page-titlebar'
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
  const [filtersOpen, setFiltersOpen] = useState(false)
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
            <div className="px-4 py-3 border-b border-border  backdrop-blur-sm">
              <Button
                variant="outline"
                size="default"
                onClick={() => setFiltersOpen(true)}
                className="w-full"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          )}
          <div className="relative flex-1 flex flex-col overflow-hidden isolate">
            <PageTitleBar
              title="Discover"
              description="Browse movies and refine results with filters"
            />
            <div className="flex-shrink-0 px-4">
              {isDesktop && filtersContent}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24 pt-4 fade-mask md:fade-left-16 fade-y-16 fade-intensity-100">
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
