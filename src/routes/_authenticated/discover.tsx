import { DiscoverFilters } from '@/components/discover/filters'
import { MovieCard } from '@/components/discover/movie-card'
import { MovieDetailsDialog } from '@/components/discover/movie-details-dialog'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { Movie } from '@/lib/tmdb-api'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { Loader2 } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
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

function DiscoverMoviesList() {
  const search = Route.useSearch()
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      tmdbQueries.discover({
        with_genres: search.genres || undefined,
        with_watch_providers: search.providers || undefined,
        'vote_average.gte': search.minRating,
        'vote_average.lte': search.maxRating,
        sort_by: search.sortBy,
      }),
    )

  const observerTarget = useRef<HTMLDivElement>(null)

  const handleMovieClick = (movie: Movie, rect: DOMRect) => {
    setSelectedMovie(movie)
    setTriggerRect(rect)
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setTimeout(() => {
        setSelectedMovie(null)
        setTriggerRect(null)
      }, 300)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const movies = data.pages.flatMap((page) => page.results)

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
        ))}
      </div>

      <MovieDetailsDialog
        movie={selectedMovie}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        triggerRect={triggerRect}
      />

      <div ref={observerTarget} className="py-8">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {!hasNextPage && movies.length > 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No more movies to load
        </div>
      )}

      {movies.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">No movies found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your filters
          </p>
        </div>
      )}
    </>
  )
}

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
          <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
            <h1 className="text-3xl font-bold">Discover Movies</h1>
            <p className="text-muted-foreground">
              Browse popular movies from your favorite streaming providers
            </p>
          </div>

          <div className="relative flex-1 overflow-hidden isolate">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-[1] pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-[1] pointer-events-none" />
            <div className="h-full overflow-y-auto px-6 py-6">
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
