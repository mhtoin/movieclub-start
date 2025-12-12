import { Movie } from '@/db/schema/movies'
import {
  useRemoveFromShortlistMutation,
  useUpdateSelectedIndexMutation,
} from '@/lib/react-query/mutations/shortlist'
import { Film } from 'lucide-react'
import { Button } from '../ui/button'

export default function ShortlistItem({
  movie,
  index,
  requiresSelection,
  selectedIndex,
}: {
  movie: Movie
  index: number
  requiresSelection?: boolean
  selectedIndex?: number | null
}) {
  const { mutate: removeFromShortlist, isPending } =
    useRemoveFromShortlistMutation()
  const { mutate: updateSelectedIndex, isPending: isUpdatingSelection } =
    useUpdateSelectedIndexMutation()

  const isSelected = requiresSelection && selectedIndex === index

  const handleToggleSelection = () => {
    if (!requiresSelection) return
    // Toggle selection: if already selected, clear it; otherwise select this one
    updateSelectedIndex(isSelected ? null : index)
  }
  const backdropPath = movie.images?.backdrops?.[0]?.file_path
  const hasBackdrop = Boolean(backdropPath)
  return (
    <div
      key={movie.id}
      className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        requiresSelection ? 'cursor-default' : 'cursor-pointer'
      } ${
        isSelected
          ? 'border-primary ring-2 ring-primary/50'
          : 'border-secondary'
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {hasBackdrop ? (
        <>
          <div className="absolute inset-0">
            <img
              src={`https://image.tmdb.org/t/p/w500${backdropPath}`}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/60 transition-all duration-300" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/50 to-accent/30 transition-all duration-300" />
      )}

      <div className="relative flex gap-4 p-4">
        <div className="relative flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden shadow-md">
          {movie.images?.posters?.[0]?.file_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${movie.images.posters[0].file_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Film className="w-8 h-8 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-snug ${hasBackdrop ? 'text-white' : ''}`}
          >
            {movie.title}
          </h3>
          <p
            className={`text-xs mb-2 ${hasBackdrop ? 'text-white/70' : 'text-muted-foreground'}`}
          >
            {movie.releaseDate
              ? new Date(movie.releaseDate).getFullYear()
              : 'N/A'}
          </p>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${hasBackdrop ? 'bg-yellow-500/20 backdrop-blur-sm' : 'bg-yellow-500/10'}`}
            >
              <span className="text-yellow-500">★</span>
              <span
                className={`font-medium ${hasBackdrop ? 'text-white' : 'text-foreground'}`}
              >
                {movie.voteAverage.toFixed(1)}
              </span>
            </div>
            {movie.runtime && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${hasBackdrop ? 'text-white/80 bg-white/10 backdrop-blur-sm' : 'text-muted-foreground bg-accent/50'}`}
              >
                {movie.runtime} min
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {requiresSelection && (
              <button
                onClick={handleToggleSelection}
                disabled={isUpdatingSelection}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : hasBackdrop
                      ? 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                      : 'bg-accent text-foreground hover:bg-accent/80'
                }`}
              >
                <div
                  className={`relative w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'border-primary-foreground bg-primary-foreground/20'
                      : hasBackdrop
                        ? 'border-white/40'
                        : 'border-border'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3 transition-all duration-300"
                    style={{
                      opacity: isSelected ? 1 : 0,
                      transform: isSelected
                        ? 'scale(1) rotate(0deg)'
                        : 'scale(0.5) rotate(-90deg)',
                    }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>{isSelected ? 'Selected' : 'Select'}</span>
              </button>
            )}
            <Button
              variant="destructive"
              size="xs"
              loading={isPending}
              onClick={() => removeFromShortlist(movie.id)}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
