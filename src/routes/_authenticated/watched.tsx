import { Button } from '@/components/ui/button'
import {
  DrawerClose,
  DrawerContent,
  DrawerHandle,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import Input from '@/components/ui/input'
import Filters from '@/components/watched/filters'
import { WatchedItem } from '@/components/watched/watched-item'
import WatchedSkeleton from '@/components/watched/watched-skeleton'
import { useDebouncedValue, useMediaQuery } from '@/lib/hooks'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { userQueries } from '@/lib/react-query/queries/users'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  retainSearchParams,
  stripSearchParams,
} from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { format } from 'date-fns'
import { Calendar, Filter, Search, X } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { z } from 'zod'

const defaultValues = {
  search: '',
  user: '',
  genre: '',
  month: '',
}

const watchedSearchSchema = z.object({
  search: fallback(z.string(), '').default(defaultValues.search),
  user: fallback(z.string(), '').default(defaultValues.user),
  genre: fallback(z.string(), '').default(defaultValues.genre),
  month: fallback(z.string(), '').default(defaultValues.month),
})

export const Route = createFileRoute('/_authenticated/watched')({
  validateSearch: zodValidator(watchedSearchSchema),
  search: {
    middlewares: [
      stripSearchParams(defaultValues),
      retainSearchParams(['user', 'genre', 'month', 'search']),
    ],
  },
  loaderDeps: ({ search: { search, user, genre } }) => ({
    search,
    user,
    genre,
  }),
  loader: async ({ context, deps: { search, user, genre } }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        movieQueries.watched(search, user, genre),
      ),
      context.queryClient.prefetchQuery(userQueries.all()),
      context.queryClient.prefetchQuery(tmdbQueries.genres()),
      context.queryClient.prefetchQuery(movieQueries.months()),
    ])
  },
  component: RouteComponent,
})

function WatchedMoviesList({
  searchQuery,
  user,
  genre,
}: {
  searchQuery: string
  user: string
  genre: string
}) {
  const { data } = useSuspenseQuery(
    movieQueries.watched(searchQuery, user, genre),
  )
  const isMobile = !useMediaQuery('(min-width: 768px)')

  const entries = Object.entries(data || {})

  if (isMobile) {
    return (
      <div className="relative space-y-8 pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />
        {entries.map(([yearMonth, movies]) => {
          return (
            <div id={`${yearMonth}`} key={yearMonth} className="space-y-3">
              <div className="sticky top-0 z-10 -ml-8 mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0 w-6 flex justify-center">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/60 ring-2 ring-background shadow-sm" />
                  </div>
                  <div className="flex-1 bg-gradient-to-r from-background via-background to-background/80 backdrop-blur-md rounded-lg px-4 py-2.5 shadow-sm border border-border/50">
                    <h2 className="text-base font-bold text-foreground">
                      {new Date(
                        parseInt(yearMonth.split('-')[0], 10),
                        parseInt(yearMonth.split('-')[1], 10) - 1,
                      ).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {movies?.map((movieData) => {
                  const watchDate = movieData.movie?.watchDate
                    ? new Date(movieData?.movie?.watchDate)
                    : null
                  return (
                    <div key={movieData?.movie?.id} className="relative">
                      <div className="absolute -left-[1.9rem] top-6">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-2 h-2 rounded-full bg-primary/40 ring-1 ring-background" />
                          {watchDate && (
                            <span className="text-[9px] font-semibold text-primary/70 whitespace-nowrap">
                              {format(watchDate, 'd')}
                            </span>
                          )}
                        </div>
                      </div>
                      <WatchedItem
                        movie={movieData.movie}
                        user={movieData.user}
                        compact
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
      {entries.map(([yearMonth, movies]) => {
        return (
          <div
            id={`${yearMonth}`}
            key={yearMonth}
            className="relative mb-12 last:mb-0"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-background relative">
                  <Calendar className="h-5 w-5 text-primary-foreground" />
                </div>
                <div
                  className="absolute inset-0 w-12 h-12 rounded-full bg-primary/20 animate-ping"
                  style={{ animationDuration: '3s' }}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {new Date(
                    parseInt(yearMonth.split('-')[0], 10),
                    parseInt(yearMonth.split('-')[1], 10) - 1,
                  ).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </h2>
                <div className="h-0.5 w-24 bg-gradient-to-r from-primary to-transparent mt-1" />
              </div>
            </div>
            <div className="ml-20 space-y-4">
              {movies?.map((movieData) => {
                const watchDate = movieData.movie?.watchDate
                  ? new Date(movieData?.movie?.watchDate)
                  : null
                return (
                  <div key={movieData?.movie?.id} className="relative">
                    <div className="absolute -left-[4.5rem] top-1/2 -translate-y-1/2">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-primary/60 ring-2 ring-background shadow-md" />
                        {watchDate && (
                          <span className="text-[10px] font-semibold text-primary mt-1 whitespace-nowrap">
                            {format(watchDate, 'd')}
                          </span>
                        )}
                      </div>
                      <div className="absolute left-6 top-[7px] w-8 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
                    </div>
                    <WatchedItem
                      movie={movieData.movie}
                      user={movieData.user}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RouteComponent() {
  const { search: initialSearch } = Route.useSearch()
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const navigate = Route.useNavigate()
  const { user, genre } = Route.useSearch()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const isMobile = !useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    navigate({
      search: (prev) => {
        const searchValue =
          debouncedSearch.trim().length >= 2 ? debouncedSearch.trim() : ''

        if (searchValue) {
          return { ...prev, search: searchValue }
        } else {
          const { search: _, ...rest } = prev
          return rest
        }
      },
    })
  }, [debouncedSearch, navigate])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const activeFiltersCount = [user, genre].filter(Boolean).length

  return (
    <div className="h-full container mx-auto px-4 md:px-4 py-4 md:py-8 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 relative mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
          Watch History
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
          {isMobile ? 'Movies watched' : 'A timeline of all the movies watched'}
        </p>
        {isMobile ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search movies..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10 h-11"
              />
            </div>
            <DrawerRoot
              direction="bottom"
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              modal
            >
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4 group-hover:text-primary transition-colors" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold animate-in fade-in-0 zoom-in-95">
                        {activeFiltersCount}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {activeFiltersCount > 0 ? 'Active' : 'Tap to filter'}
                  </span>
                </Button>
              </DrawerTrigger>
              <DrawerPortal>
                <DrawerOverlay opacity="heavy" />
                <DrawerContent
                  direction="bottom"
                  size="xl"
                  className="rounded-t-2xl"
                >
                  <div className="flex justify-center pt-4 pb-2">
                    <DrawerHandle
                      direction="bottom"
                      className="bg-muted-foreground/30"
                    />
                  </div>
                  <div className="px-6 pb-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <DrawerTitle className="text-xl font-bold">
                          Filters
                        </DrawerTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Refine your watch history
                        </p>
                      </div>
                      <DrawerClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </DrawerClose>
                    </div>

                    <Filters
                      variant="mobile"
                      onFilterApply={() => setFiltersOpen(false)}
                    />

                    {activeFiltersCount > 0 && (
                      <div className="mt-6 pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            navigate({
                              search: { search: search || undefined },
                            })
                            setFiltersOpen(false)
                          }}
                        >
                          Clear all filters
                        </Button>
                      </div>
                    )}
                  </div>
                </DrawerContent>
              </DrawerPortal>
            </DrawerRoot>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search movies..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Filters />
          </div>
        )}

        {debouncedSearch.trim() && (
          <div className="border-l-4 border-primary pl-4 my-4 md:my-6 ml-0 md:ml-4">
            <h2 className="text-base md:text-lg font-semibold">
              Search Results
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Showing results for &ldquo;{debouncedSearch}&rdquo;
            </p>
          </div>
        )}
      </div>

      <div className="relative flex-1 overflow-hidden isolate">
        <div className="h-full overflow-y-auto -mx-4 px-4 md:px-10 pt-2 md:pt-6 fade-mask fade-y-16 dark:fade-y-84 fade-intensity-100">
          <Suspense fallback={<WatchedSkeleton />}>
            <WatchedMoviesList
              searchQuery={debouncedSearch}
              user={user}
              genre={genre}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
