import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query'
import { Film, Loader2, Plus, Search, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { MovieWithCredits } from '@/db/schema/movies'
import type { Movie as TmdbMovie } from '@/lib/tmdb-api'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { adminQueries } from '@/lib/react-query/queries/admin'
import { useAdminShortlistMutation } from '@/lib/react-query/mutations/admin'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { getImageUrl } from '@/lib/tmdb-api'

export function ManageShortlists() {
  const { data: shortlists } = useSuspenseQuery(adminQueries.shortlists())
  const [userId, setUserId] = useState(shortlists[0]?.user.id ?? '')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const mutations = useAdminShortlistMutation()
  const selectedShortlist = shortlists.find((entry) => entry.user.id === userId)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timeout)
  }, [search])

  const searchQuery = useInfiniteQuery({
    ...tmdbQueries.search(debouncedSearch),
    enabled: debouncedSearch.length >= 2 && Boolean(selectedShortlist),
  })
  const results =
    searchQuery.data?.pages.flatMap((page) => page.results).slice(0, 6) ?? []
  const movieIds = new Set(
    selectedShortlist?.movies.map((movie) => movie.tmdbId),
  )
  const isFull = (selectedShortlist?.movies.length ?? 0) >= 3

  return (
    <section className="rounded-2xl border border-border/40 bg-card/50 p-5 shadow-sm backdrop-blur-sm md:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Film className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Manage shortlists
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Add or remove movies for any member of the club.
          </p>
        </div>
      </div>

      {shortlists.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
          No user shortlists are available.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              className="flex items-center gap-2 text-sm font-medium"
              htmlFor="shortlist-user"
            >
              <UserRound className="size-4 text-muted-foreground" />
              Member
            </label>
            <select
              id="shortlist-user"
              value={userId}
              onChange={(event) => {
                setUserId(event.target.value)
                setSearch('')
              }}
              className="h-10 w-full rounded-md border border-border/60 bg-background px-3 text-sm text-foreground outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {shortlists.map((entry) => (
                <option key={entry.user.id} value={entry.user.id}>
                  {entry.user.name} ({entry.movies.length}/3 movies)
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {selectedShortlist?.movies.map((movie) => (
              <ShortlistMovie
                key={movie.id}
                movie={movie}
                onRemove={() =>
                  mutations.remove.mutate({ userId, movieId: movie.id })
                }
                isPending={mutations.remove.isPending}
              />
            ))}
            {Array.from({
              length: 3 - (selectedShortlist?.movies.length ?? 0),
            }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/10 p-4 text-center text-xs text-muted-foreground"
              >
                Empty slot
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-border/30 pt-5">
            <label
              className="flex items-center gap-2 text-sm font-medium"
              htmlFor="admin-shortlist-search"
            >
              <Search className="size-4 text-muted-foreground" />
              Add a movie
            </label>
            <div className="relative">
              <Input
                id="admin-shortlist-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  isFull
                    ? 'Shortlist full (maximum 3 movies)'
                    : 'Search by movie title...'
                }
                disabled={isFull}
              />
            </div>
            {debouncedSearch.length >= 2 && !isFull && (
              <div className="max-h-64 overflow-y-auto rounded-lg border border-border/50 bg-background p-1">
                {searchQuery.isFetching && (
                  <Loader2 className="mx-auto my-4 size-4 animate-spin text-muted-foreground" />
                )}
                {!searchQuery.isFetching && results.length === 0 && (
                  <p className="px-3 py-3 text-sm text-muted-foreground">
                    No movies found.
                  </p>
                )}
                {results.map((movie) => (
                  <SearchResult
                    key={movie.id}
                    movie={movie}
                    isAdded={movieIds.has(movie.id)}
                    isPending={mutations.add.isPending}
                    onAdd={() => {
                      mutations.add.mutate(
                        { userId, tmdbId: movie.id },
                        { onSuccess: () => setSearch('') },
                      )
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function ShortlistMovie({
  movie,
  onRemove,
  isPending,
}: {
  movie: MovieWithCredits
  onRemove: () => void
  isPending: boolean
}) {
  const poster = getImageUrl(
    movie.images?.posters?.[0]?.file_path ?? null,
    'w200',
  )
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-2">
      <div className="aspect-[2/3] overflow-hidden rounded-lg bg-muted">
        {poster ? (
          <img src={poster} alt="" className="size-full object-cover" />
        ) : (
          <Film className="m-auto mt-12 size-6 text-muted-foreground/40" />
        )}
      </div>
      <p className="truncate px-1 pt-2 text-sm font-medium">{movie.title}</p>
      <button
        type="button"
        onClick={onRemove}
        disabled={isPending}
        aria-label={`Remove ${movie.title} from shortlist`}
        className="absolute right-3 top-3 rounded-md bg-background/90 p-1.5 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-destructive disabled:opacity-50"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

function SearchResult({
  movie,
  isAdded,
  isPending,
  onAdd,
}: {
  movie: TmdbMovie
  isAdded: boolean
  isPending: boolean
  onAdd: () => void
}) {
  const poster = getImageUrl(movie.poster_path, 'w92')
  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted">
      {poster ? (
        <img src={poster} alt="" className="h-10 w-7 rounded object-cover" />
      ) : (
        <Film className="size-4 text-muted-foreground" />
      )}
      <span className="min-w-0 flex-1 truncate text-sm">
        {movie.title}
        {movie.release_date && (
          <span className="ml-1 text-muted-foreground">
            ({movie.release_date.slice(0, 4)})
          </span>
        )}
      </span>
      {isAdded ? (
        <span className="text-xs text-muted-foreground">Added</span>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onAdd}
          disabled={isPending}
          aria-label={`Add ${movie.title}`}
        >
          <Plus className="size-4" />
        </Button>
      )}
    </div>
  )
}
