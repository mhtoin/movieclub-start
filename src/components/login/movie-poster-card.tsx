import type { Movie } from '@/lib/tmdb-api'
import { cn } from '@/lib/utils'

interface MoviePosterCardProps {
  movie: Movie
  className?: string
}

export function MoviePosterCard({ movie, className }: MoviePosterCardProps) {
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null

  return (
    <div
      className={cn(
        'group relative aspect-[2/3] rounded-md bg-muted shadow-2xl overflow-hidden shrink-0 cursor-default',
        'transition-transform duration-300 ease-out hover:scale-105 hover:z-10',
        className,
      )}
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-white text-xs font-medium leading-tight line-clamp-2 mb-1">
          {movie.title}
        </p>
        {rating && (
          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3 text-yellow-400 fill-yellow-400"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-white/90 text-xs">{rating}</span>
          </div>
        )}
      </div>
    </div>
  )
}
