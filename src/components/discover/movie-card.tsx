import { getImageUrl, Movie } from '@/lib/tmdb-api'
import { Star } from 'lucide-react'
import { memo } from 'react'

export interface MovieCardProps {
  movie: Movie
  onClick?: (movie: Movie, rect: DOMRect) => void
  compact?: boolean
}

export function MovieCard({ movie, onClick, compact = false }: MovieCardProps) {
  const posterUrl = getImageUrl(movie.poster_path, compact ? 'w342' : 'w500')

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      const rect = e.currentTarget.getBoundingClientRect()
      onClick(movie, rect)
    }
  }

  if (compact) {
    return (
      <div
        className="group relative overflow-hidden rounded-md bg-card transition-all hover:shadow-lg cursor-pointer h-full"
        onClick={handleClick}
      >
        <div className="h-full overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-xs text-muted-foreground text-center px-1">
                {movie.title}
              </span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-1.5">
            <h3 className="text-xs font-semibold text-white line-clamp-2 leading-tight">
              {movie.title}
            </h3>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group relative overflow-hidden rounded-lg bg-card transition-all hover:shadow-xl cursor-pointer"
      onClick={handleClick}
    >
      <div className="aspect-[2/3] overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-102"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">No poster</span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="mb-1 text-lg font-bold text-white line-clamp-2">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{movie.vote_average?.toFixed(1) ?? 'N/A'}</span>
            </div>
            {movie.release_date && (
              <>
                <span>•</span>
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </>
            )}
          </div>
          {movie.overview && (
            <p className="mt-2 text-xs text-white/80 line-clamp-3">
              {movie.overview}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export const MemoizedMovieCard = memo(MovieCard, (prevProps, nextProps) => {
  return (
    prevProps.movie.id === nextProps.movie.id &&
    prevProps.compact === nextProps.compact
  )
})
