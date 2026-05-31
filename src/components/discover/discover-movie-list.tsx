import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Film, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { MovieCard } from './movie-card'
import { MovieDetailsDialog } from './movie-details-dialog'
import type { Movie } from '@/lib/tmdb-api'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'

interface DiscoverMoviesListProps {
  onTotalResults?: (count: number) => void
  searchQuery?: string
}

export default function DiscoverMoviesList(props: DiscoverMoviesListProps) {
  if (props.searchQuery) {
    return <SearchMoviesList {...props} searchQuery={props.searchQuery} />
  }
  return <BrowseMoviesList {...props} />
}

function useMovieDialog() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

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

  return {
    selectedMovie,
    triggerRect,
    dialogOpen,
    handleMovieClick,
    handleDialogOpenChange,
  }
}

interface MovieListSharedProps {
  onTotalResults?: (count: number) => void
}

interface MovieResultsProps {
  movies: Array<Movie>
  observerTarget: React.RefObject<HTMLDivElement | null>
  isFetchingNextPage: boolean
  hasNextPage: boolean
  endText: string
  emptyText: string
  emptyHint: string
  selectedMovie: Movie | null
  dialogOpen: boolean
  handleDialogOpenChange: (open: boolean) => void
  triggerRect: DOMRect | null
  handleMovieClick: (movie: Movie, rect: DOMRect) => void
}

function MovieResults({
  movies,
  observerTarget,
  isFetchingNextPage,
  hasNextPage,
  endText,
  emptyText,
  emptyHint,
  selectedMovie,
  dialogOpen,
  handleDialogOpenChange,
  triggerRect,
  handleMovieClick,
}: MovieResultsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
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
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {!hasNextPage && movies.length > 0 && (
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground/60">{endText}</p>
        </div>
      )}

      {movies.length === 0 && (
        <div className="py-16 flex flex-col items-center text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Film size={20} className="text-muted-foreground/50" />
          </div>
          <p className="text-base font-medium text-foreground/80">
            {emptyText}
          </p>
          <p className="text-sm text-muted-foreground mt-1.5">{emptyHint}</p>
        </div>
      )}
    </>
  )
}

function useInfiniteScroll(
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void,
) {
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
    if (currentTarget) observer.observe(currentTarget)

    return () => {
      if (currentTarget) observer.unobserve(currentTarget)
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return observerTarget
}

function BrowseMoviesList({ onTotalResults }: MovieListSharedProps) {
  const routeApi = getRouteApi('/_authenticated/discover')
  const search = routeApi.useSearch()
  const dialog = useMovieDialog()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      tmdbQueries.discover({
        with_genres: search.genres || undefined,
        with_watch_providers: search.providers || undefined,
        with_original_language: search.originalLanguage || undefined,
        'vote_average.gte': search.minRating,
        'vote_average.lte': search.maxRating,
        sort_by: search.sortBy,
      }),
    )

  const observerTarget = useInfiniteScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  )

  const movies = data.pages.flatMap((page) => page.results)
  const totalCount = data.pages[0]?.total_results ?? 0

  useEffect(() => {
    if (totalCount > 0) onTotalResults?.(totalCount)
  }, [totalCount, onTotalResults])

  return (
    <MovieResults
      movies={movies}
      observerTarget={observerTarget}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      endText={`${totalCount.toLocaleString()} movies matched your filters`}
      emptyText="No movies match your filters"
      emptyHint="Try removing some filters or adjusting the rating range."
      selectedMovie={dialog.selectedMovie}
      dialogOpen={dialog.dialogOpen}
      handleDialogOpenChange={dialog.handleDialogOpenChange}
      triggerRect={dialog.triggerRect}
      handleMovieClick={dialog.handleMovieClick}
    />
  )
}

function filterMovies(
  movies: Array<Movie>,
  genres?: string,
  originalLanguage?: string,
  minRating?: number,
  maxRating?: number,
): Array<Movie> {
  let filtered = movies

  if (genres) {
    const genreIds = genres.split(',').map(Number)
    filtered = filtered.filter((movie) =>
      genreIds.some((id: number) => movie.genre_ids.includes(id)),
    )
  }

  if (originalLanguage) {
    const langs = originalLanguage.split(',')
    filtered = filtered.filter((movie) =>
      langs.includes(movie.original_language),
    )
  }

  if (minRating && minRating > 0) {
    filtered = filtered.filter((movie) => movie.vote_average >= minRating)
  }

  if (maxRating !== undefined && maxRating < 10) {
    filtered = filtered.filter((movie) => movie.vote_average <= maxRating)
  }

  return filtered
}

function SearchMoviesList({
  onTotalResults,
  searchQuery,
}: MovieListSharedProps & { searchQuery: string }) {
  const routeApi = getRouteApi('/_authenticated/discover')
  const search = routeApi.useSearch()
  const dialog = useMovieDialog()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(tmdbQueries.search(searchQuery))

  const observerTarget = useInfiniteScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  )

  const rawMovies = data.pages.flatMap((page) => page.results)
  const movies = filterMovies(
    rawMovies,
    search.genres,
    search.originalLanguage,
    search.minRating,
    search.maxRating,
  )

  useEffect(() => {
    onTotalResults?.(movies.length)
  }, [movies.length, onTotalResults])

  return (
    <MovieResults
      movies={movies}
      observerTarget={observerTarget}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      endText={`End of results for &ldquo;${searchQuery}&rdquo;`}
      emptyText="No results found"
      emptyHint="Try a different search term or adjust your filters."
      selectedMovie={dialog.selectedMovie}
      dialogOpen={dialog.dialogOpen}
      handleDialogOpenChange={dialog.handleDialogOpenChange}
      triggerRect={dialog.triggerRect}
      handleMovieClick={dialog.handleMovieClick}
    />
  )
}
