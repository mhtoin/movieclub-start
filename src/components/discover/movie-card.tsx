import { memo } from 'react'
import { Check, Loader2, Plus, Star } from 'lucide-react'
import type { Movie } from '@/lib/tmdb-api'
import { getImageUrl, getResponsiveImageProps } from '@/lib/tmdb-api'
import { useAddToShortlistMutation } from '@/lib/react-query/mutations/shortlist'

export interface MovieCardProps {
  movie: Movie
  onClick?: (movie: Movie, rect: DOMRect) => void
  compact?: boolean
}

export function MovieCard({ movie, onClick, compact = false }: MovieCardProps) {
  const posterUrl = getImageUrl(movie.poster_path, compact ? 'w342' : 'w500')
  const posterImage = getResponsiveImageProps(
    movie.poster_path,
    'poster',
    compact ? 'w342' : 'w500',
  )
  const {
    mutate: addToShortlist,
    isPending,
    isSuccess,
  } = useAddToShortlistMutation()

  const handleOpenMovie = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      const rect = e.currentTarget.getBoundingClientRect()
      onClick(movie, rect)
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        className="group overflow-hidden rounded-md bg-card h-full w-full text-left focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        onClick={handleOpenMovie}
      >
        <div className="h-full overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] fine-hover:group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-sm text-muted-foreground px-2 text-center line-clamp-2">
                {movie.title}
              </span>
            </div>
          )}
        </div>
      </button>
    )
  }

  return (
    <article className="group min-w-0">
      <button
        type="button"
        className="block w-full cursor-pointer rounded-[0.7rem] text-left focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-3"
        onClick={handleOpenMovie}
        aria-label={`View details for ${movie.title}`}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-[0.7rem] border border-border/50 bg-card shadow-sm transition-[transform,box-shadow] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] fine-hover:group-hover:-translate-y-0.5 fine-hover:group-hover:shadow-lg">
          {posterImage ? (
            <img
              src={posterImage.src}
              srcSet={posterImage.srcSet}
              sizes="(min-width: 1536px) 11vw, (min-width: 1280px) 14vw, (min-width: 1024px) 18vw, (min-width: 768px) 22vw, 44vw"
              alt={movie.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] fine-hover:group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted px-4 text-center">
              <span className="font-cinema text-xl uppercase tracking-wide text-muted-foreground/70">
                {movie.title}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          {movie.vote_average > 0 && (
            <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Star className="size-3 fill-amber-300 text-amber-300" />
              {movie.vote_average.toFixed(1)}
            </span>
          )}
        </div>
      </button>
      <div className="mt-2 flex items-start gap-2 px-0.5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
            {movie.title}
          </h3>
          <p className="mt-1 truncate text-xs text-muted-foreground/70">
            {movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : 'Release date unknown'}
            {movie.original_language && (
              <span className="ml-1.5 uppercase text-muted-foreground/50">
                · {movie.original_language}
              </span>
            )}
          </p>
          {movie.overview && (
            <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-muted-foreground/60">
              {movie.overview}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label={
            isSuccess
              ? `${movie.title} added to shortlist`
              : `Add ${movie.title} to shortlist`
          }
          title={isSuccess ? 'Added to shortlist' : 'Add to shortlist'}
          disabled={isPending || isSuccess}
          onClick={(event) => {
            event.stopPropagation()
            addToShortlist(movie.id)
          }}
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground transition-[transform,background-color,color,border-color] duration-[150ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-[0.97] disabled:cursor-default disabled:opacity-100"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : isSuccess ? (
            <Check className="size-3.5 text-success" />
          ) : (
            <Plus className="size-3.5" />
          )}
        </button>
      </div>
    </article>
  )
}

export const MemoizedMovieCard = memo(MovieCard, (prevProps, nextProps) => {
  return (
    prevProps.movie.id === nextProps.movie.id &&
    prevProps.compact === nextProps.compact
  )
})
