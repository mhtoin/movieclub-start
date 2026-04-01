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
  DrawerTrigger,
} from '@/components/ui/drawer'
import Input from '@/components/ui/input'
import Filters from '@/components/watched/filters'
import { WatchedEmptyState } from '@/components/watched/watched-empty-state'
import { WatchedItem } from '@/components/watched/watched-item'
import WatchedSkeleton from '@/components/watched/watched-skeleton'
import { useDebouncedCallback, useMediaQuery } from '@/lib/hooks'
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
import { Filter, Search, X } from 'lucide-react'
import { Suspense, useState } from 'react'
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
  loaderDeps: ({ search: { search, user, genre, month } }) => ({
    search,
    user,
    genre,
    month,
  }),
  loader: ({ context, deps: { search, user, genre, month } }) => {
    context.queryClient.prefetchQuery(
      movieQueries.watched(search, user, genre, month),
    )
    context.queryClient.prefetchQuery(userQueries.all())
    context.queryClient.prefetchQuery(tmdbQueries.genres())
    context.queryClient.prefetchQuery(movieQueries.months())
  },
  component: RouteComponent,
})

function WatchedMoviesList({
  searchQuery,
  user,
  genre,
  month,
}: {
  searchQuery: string
  user: string
  genre: string
  month: string
}) {
  const { data } = useSuspenseQuery(
    movieQueries.watched(searchQuery, user, genre, month),
  )
  const isMobile = !useMediaQuery('(min-width: 768px)')

  const entries = Object.entries(data || {})

  if (entries.length === 0) {
    return <WatchedEmptyState />
  }

  if (isMobile) {
    return (
      <div className="relative space-y-8 pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-primary/20" />
        {entries.map(([yearMonth, movies]) => {
          return (
            <div id={`${yearMonth}`} key={yearMonth} className="space-y-3">
              <div className="sticky top-0 z-10 -ml-8 mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="relative flex-shrink-0 w-12 h-10 rounded overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, oklch(0.35 0.035 var(--scheme-hue, 260)) 0%, oklch(0.25 0.01 var(--scheme-hue, 260)) 100%)`,
                      maskImage: `radial-gradient(circle at 0px 50%, transparent 14px, black 14px)`,
                      WebkitMaskImage: `radial-gradient(circle at 0px 50%, transparent 14px, black 14px)`,
                    }}
                  >
                    <div
                      className="absolute left-[42px] top-0 bottom-0 w-px opacity-50"
                      style={{
                        background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 4px, oklch(0.45 0.02 var(--scheme-hue, 260)) 4px, oklch(0.45 0.02 var(--scheme-hue, 260)) 7px)`,
                      }}
                    />
                    <div className="flex flex-col items-center justify-center h-full">
                      <span
                        className="text-[8px] uppercase tracking-wider leading-none"
                        style={{
                          color: `oklch(0.6 0.02 var(--scheme-hue, 260))`,
                          fontFamily: 'var(--font-cinema)',
                        }}
                      >
                        {new Date(
                          parseInt(yearMonth.split('-')[0], 10),
                          parseInt(yearMonth.split('-')[1], 10) - 1,
                        ).toLocaleString('en-US', { month: 'short' })}
                      </span>
                      <span
                        className="text-sm font-bold leading-none"
                        style={{
                          color: `oklch(0.95 0.01 var(--scheme-hue, 260))`,
                          fontFamily: 'var(--font-cinema)',
                        }}
                      >
                        {new Date(
                          parseInt(yearMonth.split('-')[0], 10),
                          parseInt(yearMonth.split('-')[1], 10) - 1,
                        ).toLocaleString('en-US', { year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      {movies?.length}{' '}
                      {movies?.length === 1 ? 'movie' : 'movies'}
                    </p>
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
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/30" />
      {entries.map(([yearMonth, movies]) => {
        return (
          <div
            id={`${yearMonth}`}
            key={yearMonth}
            className="relative mb-12 last:mb-0"
          >
            <div className="sticky top-0 z-10  py-4 -mx-4 px-4 mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="relative flex-shrink-0 w-[76px] h-14 rounded overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, oklch(0.35 0.035 var(--scheme-hue, 260)) 0%, oklch(0.25 0.01 var(--scheme-hue, 260)) 100%)`,
                    maskImage: `radial-gradient(circle at 0% 50%, transparent 10px, black 10px)`,
                    WebkitMaskImage: `radial-gradient(circle at 0% 50%, transparent 10px, black 10px)`,
                  }}
                >
                  <div
                    className="absolute left-[62px] top-0 bottom-0 w-px opacity-50"
                    style={{
                      background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, oklch(0.45 0.02 var(--scheme-hue, 260)) 6px, oklch(0.45 0.02 var(--scheme-hue, 260)) 10px)`,
                    }}
                  />
                  <div className="flex flex-col items-center justify-center h-full">
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{
                        color: `oklch(0.6 0.02 var(--scheme-hue, 260))`,
                        fontFamily: 'var(--font-cinema)',
                      }}
                    >
                      {new Date(
                        parseInt(yearMonth.split('-')[0], 10),
                        parseInt(yearMonth.split('-')[1], 10) - 1,
                      ).toLocaleString('en-US', { month: 'short' })}
                    </span>
                    <span
                      className="text-lg font-bold leading-none"
                      style={{
                        color: `oklch(0.95 0.01 var(--scheme-hue, 260))`,
                        fontFamily: 'var(--font-cinema)',
                      }}
                    >
                      {new Date(
                        parseInt(yearMonth.split('-')[0], 10),
                        parseInt(yearMonth.split('-')[1], 10) - 1,
                      ).toLocaleString('en-US', { year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-20 space-y-4">
              {movies?.map((movieData) => {
                const watchDate = movieData.movie?.watchDate
                  ? new Date(movieData?.movie?.watchDate)
                  : null
                return (
                  <div key={movieData?.movie?.id} className="relative">
                    <div className="absolute -left-[5.5rem] top-1/2 -translate-y-1/2">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-primary ring-2 ring-background" />
                        {watchDate && (
                          <span className="text-[10px] font-semibold text-primary mt-1 whitespace-nowrap">
                            {format(watchDate, 'd')}
                          </span>
                        )}
                      </div>
                      <div className="absolute left-8 top-[7px] w-14 h-0.5 bg-primary/30" />
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
  const { search: urlSearch, user, genre, month } = Route.useSearch()
  // Local state for the input — stays snappy on every keystroke.
  // The URL param (urlSearch) is the debounced, committed value used for
  // data-fetching; it only updates after the user pauses typing.
  const [localSearch, setLocalSearch] = useState(urlSearch)
  const navigate = Route.useNavigate()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const isMobile = !useMediaQuery('(min-width: 768px)')

  // Debounce URL updates so the loader only re-runs after the user pauses
  // typing.  No useEffect needed — the callback fires on user action.
  const debouncedNavigate = useDebouncedCallback((value: string) => {
    navigate({
      search: (prev) => {
        const trimmed = value.trim()
        if (trimmed.length >= 2) {
          return { ...prev, search: trimmed }
        }
        const { search: _, ...rest } = prev
        return rest
      },
    })
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)
    debouncedNavigate(value)
  }

  const activeFiltersCount = [user, genre].filter(Boolean).length

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="md:pl-14">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <PageTitleBar
            title="Watch History"
            description="A timeline of all the movies watched"
          />
          <div className="flex-shrink-0">
            {isMobile ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search movies..."
                    value={localSearch}
                    onChange={handleSearchChange}
                    className="pl-10 h-10"
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
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                    >
                      <Filter className="h-4 w-4" />
                      {activeFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
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
                                  search: { search: localSearch || undefined },
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
                    value={localSearch}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
                <Filters />
              </div>
            )}

            {localSearch.trim() && (
              <div className="border-l-4 border-primary pl-4 my-4 md:my-6 ml-0 md:ml-4">
                <h2 className="text-base md:text-lg font-semibold">
                  Search Results
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Showing results for &ldquo;{localSearch}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden isolate md:pl-14">
        <div className="h-full overflow-y-auto -mx-4 px-4 md:px-10 pt-2 md:pt-6 fade-mask fade-y-16 dark:fade-y-10 fade-intensity-100">
          <Suspense fallback={<WatchedSkeleton />}>
            <WatchedMoviesList
              searchQuery={urlSearch}
              user={user}
              genre={genre}
              month={month}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
