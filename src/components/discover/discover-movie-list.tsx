import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Film, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MovieCard } from './movie-card'
import { MovieDetailsDialog } from './movie-details-dialog'
import type { Movie } from '@/lib/tmdb-api'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'

interface DiscoverMoviesListProps {
  onTotalResults?: (count: number) => void
  addingMode?: boolean
  onAdded?: () => void
  searchQuery?: string
}

export default function DiscoverMoviesList(props: DiscoverMoviesListProps) {
  if (props.searchQuery) {
    return <SearchMoviesList {...props} searchQuery={props.searchQuery} />
  }
  return <BrowseMoviesList {...props} />
}

interface MovieListSharedProps {
  onTotalResults?: (count: number) => void
  addingMode?: boolean
  onAdded?: () => void
}

function BrowseMoviesList({
  onTotalResults,
  addingMode = false,
  onAdded,
}: MovieListSharedProps) {
  const routeApi = getRouteApi('/_authenticated/discover')
  const search = routeApi.useSearch()
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

  const movies = data.pages.flatMap((page) => page.results)
  const totalCount = data.pages[0]?.total_results ?? 0

  useEffect(() => {
    if (onTotalResults && totalCount > 0) {
      onTotalResults(totalCount)
    }
  }, [totalCount, onTotalResults])

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

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
        ))}
      </div>

      <MovieDetailsDialog
        movie={selectedMovie}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        triggerRect={triggerRect}
        addingMode={addingMode}
        onAdded={onAdded}
      />

      <div ref={observerTarget} className="py-8">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {!hasNextPage && movies.length > 0 && (
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground/60">
            {totalCount.toLocaleString()} movies matched your filters
          </p>
        </div>
      )}

      {movies.length === 0 && (
        <div className="py-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Film size={20} className="text-muted-foreground/50" />
          </div>
          <p className="text-base font-medium text-foreground/80">
            No movies match your filters
          </p>
          <p className="text-sm text-muted-foreground mt-1.5">
            Try removing some filters or adjusting the rating range.
          </p>
        </div>
      )}
    </>
  )
}

function SearchMoviesList({
  onTotalResults,
  addingMode = false,
  onAdded,
  searchQuery,
}: MovieListSharedProps & { searchQuery: string }) {
  const routeApi = getRouteApi('/_authenticated/discover')
  const search = routeApi.useSearch()
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(tmdbQueries.search(searchQuery))

  const observerTarget = useRef<HTMLDivElement>(null)

  const rawMovies = data.pages.flatMap((page) => page.results)

  const movies = useMemo(() => {
    let filtered = rawMovies

    if (search.genres) {
      const genreIds = search.genres.split(',').map(Number)
      filtered = filtered.filter((movie) =>
        genreIds.some((id: number) => movie.genre_ids.includes(id)),
      )
    }

    if (search.minRating > 0) {
      filtered = filtered.filter(
        (movie) => movie.vote_average >= search.minRating,
      )
    }

    if (search.maxRating < 10) {
      filtered = filtered.filter(
        (movie) => movie.vote_average <= search.maxRating,
      )
    }

    return filtered
  }, [rawMovies, search.genres, search.minRating, search.maxRating])

  useEffect(() => {
    onTotalResults?.(movies.length)
  }, [movies.length, onTotalResults])

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

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
        ))}
      </div>

      <MovieDetailsDialog
        movie={selectedMovie}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        triggerRect={triggerRect}
        addingMode={addingMode}
        onAdded={onAdded}
      />

      <div ref={observerTarget} className="py-8">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {!hasNextPage && movies.length > 0 && (
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground/60">
            End of results for &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      )}

      {movies.length === 0 && (
        <div className="py-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Film size={20} className="text-muted-foreground/50" />
          </div>
          <p className="text-base font-medium text-foreground/80">
            No results found
          </p>
          <p className="text-sm text-muted-foreground mt-1.5">
            Try a different search term or adjust your filters.
          </p>
        </div>
      )}
    </>
  )
}
