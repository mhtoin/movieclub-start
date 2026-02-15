import { GenreFilter } from '@/components/discover/genre-filter'
import { MovieDetailsDialog } from '@/components/discover/movie-details-dialog'
import { ProviderFilter } from '@/components/discover/provider-filter'
import { RatingFilter } from '@/components/discover/rating-filter'
import { SortByFilter } from '@/components/discover/sort-by-filter'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { useAddToShortlistMutation } from '@/lib/react-query/mutations/shortlist'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { getImageUrl, Movie } from '@/lib/tmdb-api'
import { cn } from '@/lib/utils'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'

interface AddMovieDialogProps {
  movieCount: number
}

export function AddMovieDialog({ movieCount }: AddMovieDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    '8',
    '323',
    '463',
    '496',
  ])
  const [voteRange, setVoteRange] = useState<[number, number]>([0, 10])
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const { mutate: addToShortlist, isPending } = useAddToShortlistMutation()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleAddMovie = (movie: Movie) => {
    addToShortlist(movie.id, {
      onSuccess: () => {
        setIsOpen(false)
        setSearchQuery('')
        setSelectedGenres([])
        setSelectedProviders(['8', '323', '463', '496'])
        setVoteRange([0, 10])
        setSortBy('popularity.desc')
      },
    })
  }

  const handleMovieInfo = (movie: Movie, rect: DOMRect) => {
    setSelectedMovie(movie)
    setTriggerRect(rect)
    setDetailsDialogOpen(true)
  }

  const handleDetailsDialogClose = (open: boolean) => {
    setDetailsDialogOpen(open)
    if (!open) {
      setTimeout(() => {
        setSelectedMovie(null)
        setTriggerRect(null)
      }, 300)
    }
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={setIsOpen}>
      <ResponsiveDialog.Trigger asChild>
        <Button
          variant="ghost"
          className="w-full h-auto py-2.5 px-3 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-foreground">Add Movie</p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {3 - movieCount} slot{3 - movieCount === 1 ? '' : 's'} left
              </p>
            </div>
          </div>
        </Button>
      </ResponsiveDialog.Trigger>
      <ResponsiveDialog.Content
        size="xl"
        opacity="medium"
        className="h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Add Movie</h2>
              <p className="text-sm text-muted-foreground">
                Search and add movies to your shortlist
              </p>
            </div>
          </div>
          <ResponsiveDialog.Close>
            <button className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors group">
              <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </ResponsiveDialog.Close>
        </div>

        <div className="space-y-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {!debouncedQuery && (
            <div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowFilters(!showFilters)
                }}
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              <div
                className={cn(
                  'rounded-xl bg-muted/30 border transition-all duration-300 origin-top',
                  showFilters
                    ? 'mt-4 p-4 border-border opacity-100'
                    : 'mt-0 p-0 border-transparent opacity-0',
                )}
                style={{
                  display: 'grid',
                  gridTemplateRows: showFilters ? '1fr' : '0fr',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div className="space-y-4 px-4">
                    <SortByFilter value={sortBy} onValueChange={setSortBy} />
                    <GenreFilter
                      selectedGenres={selectedGenres}
                      onGenresChange={setSelectedGenres}
                    />
                    <ProviderFilter
                      selectedProviders={selectedProviders}
                      onProvidersChange={setSelectedProviders}
                    />
                    <RatingFilter
                      voteRange={voteRange}
                      onVoteRangeChange={setVoteRange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto -mx-2 px-2 min-h-0">
          <Suspense
            fallback={
              <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            {debouncedQuery ? (
              <SearchResults
                query={debouncedQuery}
                onAddMovie={handleAddMovie}
                onMovieInfo={handleMovieInfo}
                isPending={isPending}
              />
            ) : (
              <PopularMovies
                onAddMovie={handleAddMovie}
                onMovieInfo={handleMovieInfo}
                isPending={isPending}
                selectedGenres={selectedGenres}
                selectedProviders={selectedProviders}
                voteRange={voteRange}
                sortBy={sortBy}
              />
            )}
          </Suspense>
        </div>

        <MovieDetailsDialog
          movie={selectedMovie}
          open={detailsDialogOpen}
          onOpenChange={handleDetailsDialogClose}
          triggerRect={triggerRect}
        />
      </ResponsiveDialog.Content>
    </ResponsiveDialog>
  )
}

interface MovieListProps {
  onAddMovie: (movie: Movie) => void
  onMovieInfo: (movie: Movie, rect: DOMRect) => void
  isPending: boolean
}

function PopularMovies({
  onAddMovie,
  onMovieInfo,
  isPending,
  selectedGenres,
  selectedProviders,
  voteRange,
  sortBy,
}: MovieListProps & {
  selectedGenres: string[]
  selectedProviders: string[]
  voteRange: [number, number]
  sortBy: string
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      tmdbQueries.discover({
        with_genres:
          selectedGenres.length > 0 ? selectedGenres.join(',') : undefined,
        with_watch_providers:
          selectedProviders.length > 0
            ? selectedProviders.join('|')
            : undefined,
        'vote_average.gte': voteRange[0],
        'vote_average.lte': voteRange[1],
        sort_by: sortBy,
      }),
    )

  const observerTarget = useRef<HTMLDivElement>(null)

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {movies.map((movie) => (
          <MovieListItem
            key={movie.id}
            movie={movie}
            onAdd={onAddMovie}
            onInfo={onMovieInfo}
            isPending={isPending}
          />
        ))}
      </div>

      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    </>
  )
}

function SearchResults({
  query,
  onAddMovie,
  onMovieInfo,
  isPending,
}: MovieListProps & { query: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(tmdbQueries.search(query))

  const observerTarget = useRef<HTMLDivElement>(null)

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

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg text-foreground font-medium">No movies found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try a different search term
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {movies.map((movie) => (
          <MovieListItem
            key={movie.id}
            movie={movie}
            onAdd={onAddMovie}
            onInfo={onMovieInfo}
            isPending={isPending}
          />
        ))}
      </div>

      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    </>
  )
}

interface MovieListItemProps {
  movie: Movie
  onAdd: (movie: Movie) => void
  onInfo: (movie: Movie, rect: DOMRect) => void
  isPending: boolean
}

function MovieListItem({
  movie,
  onAdd,
  onInfo,
  isPending,
}: MovieListItemProps) {
  const posterUrl = getImageUrl(movie.poster_path, 'w500')

  return (
    <div className="group relative overflow-hidden rounded-lg bg-card border border-border transition-all hover:shadow-lg">
      <div className="aspect-[2/3] overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">No poster</span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-0 p-3 flex flex-col">
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              onInfo(movie, rect)
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <Info className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white line-clamp-2 mb-1 pr-8">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{movie.vote_average?.toFixed(1) ?? 'N/A'}</span>
              </div>
              {movie.release_date && (
                <>
                  <span>•</span>
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onAdd(movie)}
            disabled={isPending}
            className="w-full mt-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
