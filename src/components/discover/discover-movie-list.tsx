import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { Movie } from '@/lib/tmdb-api'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { MovieCard } from './movie-card'
import { MovieDetailsDialog } from './movie-details-dialog'

export default function DiscoverMoviesList() {
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
