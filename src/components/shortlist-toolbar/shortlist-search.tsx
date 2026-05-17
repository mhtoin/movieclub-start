import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  ExternalLink,
  Film,
  Loader2,
  Plus,
  Search,
  Star,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useDebouncedValue } from '@/lib/hooks'
import { searchMovies } from '@/lib/tmdb-api'
import { useAddToShortlistMutation } from '@/lib/react-query/mutations/shortlist'

const MIN_SEARCH_LENGTH = 2

interface SearchResultItem {
  id: number
  title: string
  year: string | null
  posterPath: string | null
  rating: number
}

interface ShortlistSearchProps {
  movieCount: number
  shortlistMovieIds: Set<number>
  onSearchActiveChange: (active: boolean) => void
}

function SearchResultRow({
  movie,
  isAlreadyAdded,
  isFull,
  onAddSuccess,
}: {
  movie: SearchResultItem
  isAlreadyAdded: boolean
  isFull: boolean
  onAddSuccess: () => void
}) {
  const { mutate: addToShortlist, isPending } = useAddToShortlistMutation()
  const [showAdded, setShowAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isAlreadyAdded || isFull || isPending) return
    addToShortlist(movie.id, {
      onSuccess: () => {
        setShowAdded(true)
        setTimeout(() => onAddSuccess(), 600)
      },
    })
  }

  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w92${movie.posterPath}`
    : null

  return (
    <div className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent/50 transition-colors group">
      <a
        href={`https://www.themoviedb.org/movie/${movie.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="size-8 rounded overflow-hidden bg-muted flex-shrink-0 ring-1 ring-inset ring-black/5 hover:opacity-80 transition-opacity"
      >
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="size-3.5 text-muted-foreground/40" />
          </div>
        )}
      </a>

      <div className="flex-1 min-w-0">
        <a
          href={`https://www.themoviedb.org/movie/${movie.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary transition-colors"
        >
          <span className="truncate">{movie.title}</span>
          <ExternalLink className="size-3 text-muted-foreground/40 flex-shrink-0" />
        </a>
        <div className="flex items-center gap-1.5 mt-0.5">
          {movie.year && (
            <span className="text-[10px] text-muted-foreground">
              {movie.year}
            </span>
          )}
          {movie.rating > 0 && (
            <>
              <span className="text-[10px] text-muted-foreground/30">·</span>
              <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
                <Star className="size-2.5 fill-yellow-400 text-yellow-400" />
                {movie.rating.toFixed(1)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        {isAlreadyAdded ? (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50 px-2">
            <Check className="size-3" />
            Added
          </span>
        ) : showAdded ? (
          <span className="flex items-center gap-1 text-[10px] text-success px-2">
            <Check className="size-3" />
            Added!
          </span>
        ) : isPending ? (
          <Loader2 className="size-3.5 text-muted-foreground/40 animate-spin mx-2" />
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={isFull || isPending}
            className="size-7 rounded-md border border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center transition-all group-hover:border-primary/40 group-hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Add ${movie.title} to shortlist`}
          >
            <Plus className="size-3.5 text-muted-foreground/40 hover:text-primary transition-colors" />
          </button>
        )}
      </div>
    </div>
  )
}

export function ShortlistSearch({
  movieCount,
  shortlistMovieIds,
  onSearchActiveChange,
}: ShortlistSearchProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const isFull = movieCount >= 3

  const { data: results, isFetching } = useQuery({
    queryKey: ['tmdb', 'search', 'inline', debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < MIN_SEARCH_LENGTH) return []
      const response = await searchMovies({ query: debouncedQuery, page: 1 })
      return response.results.slice(0, 6).map(
        (m): SearchResultItem => ({
          id: m.id,
          title: m.title,
          year: m.release_date ? m.release_date.slice(0, 4) : null,
          posterPath: m.poster_path,
          rating: m.vote_average,
        }),
      )
    },
    enabled: debouncedQuery.length >= MIN_SEARCH_LENGTH,
    staleTime: 1000 * 60 * 15,
  })

  useEffect(() => {
    onSearchActiveChange(query.length > 0 && !isFull)
  }, [query, isFull, onSearchActiveChange])

  const isSearching = query.length >= MIN_SEARCH_LENGTH && !isFull

  const handleAddSuccess = () => {
    setQuery('')
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder={
            isFull ? 'Shortlist full (max 3 movies)' : 'Search movies to add...'
          }
          disabled={isFull}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
          }}
          className="w-full h-8 pl-8 pr-8 text-xs rounded-lg bg-muted/50 border border-border/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-4 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 280 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="overflow-hidden"
          >
            {isFetching ? (
              <div className="flex items-center justify-center h-[220px]">
                <Loader2 className="size-5 text-muted-foreground/40 animate-spin" />
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-0.5 h-[220px] overflow-y-auto">
                {results.map((movie) => (
                  <SearchResultRow
                    key={movie.id}
                    movie={movie}
                    isAlreadyAdded={shortlistMovieIds.has(movie.id)}
                    isFull={isFull}
                    onAddSuccess={handleAddSuccess}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[220px] text-center">
                <Film className="size-6 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground">No movies found</p>
                <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                  Try a different search term
                </p>
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/discover"
                search={{ adding: true }}
                className="block w-full py-2 text-center text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/50"
              >
                Browse all movies →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSearching && !isFull && query.length === 0 && (
        <p className="text-[10px] text-muted-foreground/40 text-center leading-tight px-2">
          Search by title to find and add movies
        </p>
      )}

      {!isSearching &&
        !isFull &&
        query.length > 0 &&
        query.length < MIN_SEARCH_LENGTH && (
          <p className="text-[10px] text-muted-foreground/40 text-center">
            Type at least {MIN_SEARCH_LENGTH} characters to search
          </p>
        )}
    </div>
  )
}
