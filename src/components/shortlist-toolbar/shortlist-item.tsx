import { Movie } from '@/db/schema/movies'
import { useRemoveFromShortlistMutation } from '@/lib/react-query/mutations/shortlist'
import { Film } from 'lucide-react'
import { Button } from '../ui/button'

export default function ShortlistItem({
  movie,
  index,
}: {
  movie: Movie
  index: number
}) {
  const { mutate: removeFromShortlist, isPending } =
    useRemoveFromShortlistMutation()
  const backdropPath = movie.images?.backdrops?.[0]?.file_path
  const hasBackdrop = Boolean(backdropPath)
  return (
    <div
      key={movie.id}
      className="group relative rounded-2xl border-2 border-secondary overflow-hidden transition-all duration-300 cursor-pointer"
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
          <Button
            variant="destructive"
            className="mt-2"
            size="xs"
            loading={isPending}
            onClick={() => removeFromShortlist(movie.id)}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
