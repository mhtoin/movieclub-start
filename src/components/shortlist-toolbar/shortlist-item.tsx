import { Movie } from '@/db/schema/movies'
import {
  useRemoveFromShortlistMutation,
  useUpdateSelectedIndexMutation,
} from '@/lib/react-query/mutations/shortlist'
import { Check, Clock, Film, Star, Trash2 } from 'lucide-react'

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
  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null
  const genres = movie.genres?.slice(0, 2) ?? []

  const handleToggleSelection = () => {
    if (!requiresSelection) return
    updateSelectedIndex(isSelected ? null : index)
  }

  return (
    <div
      className={`group relative flex gap-3 p-3 rounded-lg border transition-all duration-200 ${
        isSelected
          ? 'border-primary/50 bg-primary/5 shadow-sm'
          : 'border-border/60 bg-card/50 hover:bg-accent/40 hover:border-border'
      }`}
    >
      <div className="relative flex-shrink-0 w-12 h-[72px] rounded-md overflow-hidden bg-muted shadow-sm">
        {movie.images?.posters?.[0]?.file_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w200${movie.images.posters[0].file_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-5 h-5 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-md" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="text-sm font-medium text-foreground truncate leading-tight">
            {movie.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            {year && <span>{year}</span>}
            {year && movie.runtime && <span className="text-border">·</span>}
            {movie.runtime && (
              <span className="inline-flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {movie.runtime}m
              </span>
            )}
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {movie.voteAverage.toFixed(1)}
            </span>
          </div>
        </div>
        {genres.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            {genres.map((genre) => (
              <span
                key={genre}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium leading-none"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center gap-1.5 flex-shrink-0">
        {requiresSelection && (
          <button
            onClick={handleToggleSelection}
            disabled={isUpdatingSelection}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-accent/60 text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title={isSelected ? 'Selected for raffle' : 'Select for raffle'}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => removeFromShortlist(movie.id)}
          disabled={isPending}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove from shortlist"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
