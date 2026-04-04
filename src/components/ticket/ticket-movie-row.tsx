import { Check, Film, Star } from 'lucide-react'
import type { Movie } from '@/db/schema/movies'
import { getResponsiveImageProps } from '@/lib/tmdb-api'

interface TicketMovieRowProps {
  movie: Movie
  onMovieClick?: (movie: Movie, e: React.MouseEvent<HTMLDivElement>) => void
  interactive?: boolean
  isSelected?: boolean
  showSelection?: boolean
  onSelect?: () => void
  isLoading?: boolean
}

export function TicketMovieRow({
  movie,
  onMovieClick,
  interactive = false,
  isSelected = false,
  showSelection = false,
  onSelect,
  isLoading = false,
}: TicketMovieRowProps) {
  const posterPath = movie.images?.posters?.[0]?.file_path
  const posterImage = getResponsiveImageProps(posterPath, 'poster', 'w154')
  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null
  const rating = movie.voteAverage
    ? Math.round(movie.voteAverage * 10) / 10
    : null
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null

  const baseClass = interactive
    ? 'flex items-center gap-3 p-2 rounded-md border border-transparent hover:translate-x-1 transition-all duration-200 cursor-pointer group bg-muted/50 hover:bg-muted hover:border-border'
    : 'flex items-center gap-3 p-2 rounded-md bg-muted/50'

  const selectedClass =
    showSelection && isSelected
      ? 'border-primary/50 bg-primary/5 shadow-sm'
      : ''

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showSelection && onSelect && !isLoading) {
      onSelect()
    } else if (onMovieClick) {
      onMovieClick(movie, e)
    }
  }

  return (
    <div
      className={`${baseClass} ${selectedClass} relative`}
      onClick={handleClick}
    >
      {showSelection && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.()
          }}
          disabled={isLoading}
          className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? 'bg-primary border-primary text-primary-foreground shadow-sm'
              : 'bg-card/80 border-border/60 text-transparent hover:border-primary/50 hover:bg-accent'
          }`}
          aria-label={isSelected ? 'Selected for raffle' : 'Select for raffle'}
          title={
            isSelected ? 'Selected for raffle' : 'Click to select for raffle'
          }
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}
      <div
        className={`relative flex-shrink-0 w-10 h-14 rounded-sm overflow-hidden bg-muted ${showSelection ? 'ml-7' : ''}`}
      >
        {posterImage ? (
          <img
            src={posterImage.src}
            srcSet={posterImage.srcSet}
            sizes="40px"
            alt={movie.title}
            width={40}
            height={56}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-4 h-4 opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 rounded-sm shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] pointer-events-none" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm whitespace-nowrap overflow-hidden text-ellipsis mb-0.5 font-medium text-foreground">
          {movie.title}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {year && <span>{year}</span>}
          {runtime && <span>{runtime}</span>}
          {rating !== null && (
            <span className="flex items-center gap-0.5 font-medium text-warning">
              <Star className="w-3 h-3 fill-current" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
