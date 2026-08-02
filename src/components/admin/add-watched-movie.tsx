import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query'
import {
  CalendarDays,
  CheckCircle2,
  Film,
  Search,
  UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Movie as TmdbMovie } from '@/lib/tmdb-api'
import { getImageUrl } from '@/lib/tmdb-api'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import {
  MOVIE_ALREADY_WATCHED_ERROR,
  useAddWatchedMovieMutation,
} from '@/lib/react-query/mutations/admin'
import { adminQueries } from '@/lib/react-query/queries/admin'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function AddWatchedMovie() {
  const { data: shortlists } = useSuspenseQuery(adminQueries.shortlists())
  const [userId, setUserId] = useState(shortlists[0]?.user.id ?? '')
  const [movieId, setMovieId] = useState(shortlists[0]?.movies[0]?.id ?? '')
  const [tmdbMovie, setTmdbMovie] = useState<TmdbMovie | null>(null)
  const [watchDate, setWatchDate] = useState(today)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [alreadyWatchedWarning, setAlreadyWatchedWarning] = useState(false)
  const mutation = useAddWatchedMovieMutation()

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timeout)
  }, [search])

  const searchQuery = useInfiniteQuery({
    ...tmdbQueries.search(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  })
  const searchResults =
    searchQuery.data?.pages.flatMap((page) => page.results).slice(0, 8) ?? []
  const selectedShortlist = shortlists.find((entry) => entry.user.id === userId)
  const selectedMovie = selectedShortlist?.movies.find(
    (movie) => movie.id === movieId,
  )
  const selectedMovieAlreadyWatched = Boolean(selectedMovie?.watchDate)
  const canSubmit = Boolean(userId && (movieId || tmdbMovie) && watchDate)

  const handleUserChange = (nextUserId: string) => {
    const nextShortlist = shortlists.find(
      (entry) => entry.user.id === nextUserId,
    )
    setUserId(nextUserId)
    setMovieId(nextShortlist?.movies[0]?.id ?? '')
    setTmdbMovie(null)
    setAlreadyWatchedWarning(false)
  }

  const handleShortlistMovieChange = (nextMovieId: string) => {
    setMovieId(nextMovieId)
    setTmdbMovie(null)
    setAlreadyWatchedWarning(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    if (selectedMovieAlreadyWatched && !alreadyWatchedWarning) {
      setAlreadyWatchedWarning(true)
      return
    }

    mutation.mutate(
      {
        movieId: tmdbMovie ? undefined : movieId,
        tmdbId: tmdbMovie?.id,
        userId,
        watchDate: new Date(`${watchDate}T12:00:00.000Z`),
        allowAlreadyWatched: alreadyWatchedWarning,
      },
      {
        onSuccess: () => {
          setMovieId('')
          setTmdbMovie(null)
          setSearch('')
          setAlreadyWatchedWarning(false)
        },
        onError: (error) => {
          if (
            error instanceof Error &&
            error.message === MOVIE_ALREADY_WATCHED_ERROR
          ) {
            setAlreadyWatchedWarning(true)
          }
        },
      },
    )
  }

  return (
    <section className="rounded-2xl border border-border/40 bg-card/50 p-5 shadow-sm backdrop-blur-sm md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CheckCircle2 className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Record a watched movie
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Choose a movie from a shortlist or search TMDB for any movie. Both
            options record the same winner and shortlist updates.
          </p>
        </div>
      </div>

      {shortlists.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
          No user shortlists are available.
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="flex items-center gap-2 text-sm font-medium"
                htmlFor="watched-user"
              >
                <UserRound className="size-4 text-muted-foreground" />
                Winner / shortlist owner
              </label>
              <select
                id="watched-user"
                value={userId}
                onChange={(event) => handleUserChange(event.target.value)}
                className="h-10 w-full rounded-md border border-border/60 bg-background px-3 text-sm text-foreground outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {shortlists.map((entry) => (
                  <option key={entry.user.id} value={entry.user.id}>
                    {entry.user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center gap-2 text-sm font-medium"
                htmlFor="watched-date"
              >
                <CalendarDays className="size-4 text-muted-foreground" />
                Watch date
              </label>
              <Input
                id="watched-date"
                type="date"
                value={watchDate}
                onChange={(event) => setWatchDate(event.target.value)}
                required
              />
            </div>
          </div>

          {alreadyWatchedWarning && (
            <div
              className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100"
              role="alert"
            >
              <p className="font-medium">
                This movie is already marked as watched.
              </p>
              <p className="mt-1 text-xs opacity-80">
                Submit again to replace its watch date and record this as
                another raffle result.
              </p>
            </div>
          )}

          <div className="grid gap-5 border-t border-border/30 pt-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label
                className="flex items-center gap-2 text-sm font-medium"
                htmlFor="watched-shortlist-movie"
              >
                <Film className="size-4 text-muted-foreground" />
                From this shortlist
              </label>
              <select
                id="watched-shortlist-movie"
                value={tmdbMovie ? '' : movieId}
                onChange={(event) =>
                  handleShortlistMovieChange(event.target.value)
                }
                disabled={!selectedShortlist?.movies.length}
                className="h-10 w-full rounded-md border border-border/60 bg-background px-3 text-sm text-foreground outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {selectedShortlist?.movies.length ? (
                  selectedShortlist.movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))
                ) : (
                  <option value="">No movies in shortlist</option>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center gap-2 text-sm font-medium"
                htmlFor="tmdb-movie-search"
              >
                <Search className="size-4 text-muted-foreground" />
                Search TMDB instead
              </label>
              <Input
                id="tmdb-movie-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by movie title..."
              />
              {tmdbMovie && (
                <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                  <span className="truncate font-medium">
                    {tmdbMovie.title}
                  </span>
                  <button
                    type="button"
                    className="ml-3 shrink-0 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setTmdbMovie(null)
                      setAlreadyWatchedWarning(false)
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
              {debouncedSearch.length >= 2 && !tmdbMovie && (
                <div className="max-h-64 overflow-y-auto rounded-lg border border-border/50 bg-background p-1">
                  {searchQuery.isFetching && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      Searching TMDB...
                    </p>
                  )}
                  {!searchQuery.isFetching && searchResults.length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No movies found.
                    </p>
                  )}
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted"
                      onClick={() => {
                        setTmdbMovie(result)
                        setMovieId('')
                        setAlreadyWatchedWarning(false)
                      }}
                    >
                      {getImageUrl(result.poster_path, 'w92') ? (
                        <img
                          src={getImageUrl(result.poster_path, 'w92')!}
                          alt=""
                          className="h-10 w-7 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-7 items-center justify-center rounded bg-muted">
                          <Film className="size-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {result.title}
                        {result.release_date && (
                          <span className="ml-1 text-muted-foreground">
                            ({result.release_date.slice(0, 4)})
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border/30 pt-4">
            <p className="text-xs text-muted-foreground">
              {tmdbMovie
                ? 'TMDB movie selected'
                : selectedShortlist?.movies.length
                  ? `${selectedShortlist.movies.length} movie${selectedShortlist.movies.length === 1 ? '' : 's'} available`
                  : 'Select a user with movies in their shortlist or search TMDB'}
            </p>
            <Button
              type="submit"
              variant="primary"
              disabled={!canSubmit || mutation.isPending}
            >
              {mutation.isPending
                ? 'Recording...'
                : alreadyWatchedWarning
                  ? 'Record anyway'
                  : 'Record movie'}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
