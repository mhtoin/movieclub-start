import { memo } from 'react'
import type { Movie } from '@/lib/tmdb-api'
import { getImageUrl } from '@/lib/tmdb-api'

export interface MovieCardProps {
  movie: Movie
  onClick?: (movie: Movie, rect: DOMRect) => void
  compact?: boolean
}

export function MovieCard({ movie, onClick, compact = false }: MovieCardProps) {
  const posterUrl = getImageUrl(movie.poster_path, compact ? 'w342' : 'w500')

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
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
    <button
      type="button"
      className="group cursor-pointer text-left w-full bg-transparent border-none p-0 appearance-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-lg"
      onClick={handleOpenMovie}
    >
      <div className="relative overflow-hidden rounded-lg bg-card border border-border/40 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-primary/30">
        <div className="aspect-[2/3] overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-sm text-muted-foreground">No poster</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-1.5 px-0.5">
        <h3 className="text-sm font-medium text-foreground/90 line-clamp-1 leading-snug transition-colors duration-200 group-hover:text-primary">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          {movie.release_date && (
            <span className="text-xs text-muted-foreground/60">
              {new Date(movie.release_date).getFullYear()}
            </span>
          )}
          {movie.vote_average > 0 && movie.release_date && (
            <span className="text-[10px] text-muted-foreground/25">
              &middot;
            </span>
          )}
          {movie.vote_average > 0 && (
            <span className="text-xs text-muted-foreground/60">
              {movie.vote_average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export const MemoizedMovieCard = memo(MovieCard, (prevProps, nextProps) => {
  return (
    prevProps.movie.id === nextProps.movie.id &&
    prevProps.compact === nextProps.compact
  )
})
