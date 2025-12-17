import type { Movie } from '@/db/schema/movies'
import { getImageUrl } from '@/lib/tmdb-api'

export default function MoviePoster({
  movie,
  movieIndex,
  handleMovieClick,
  hoveredMovieId,
  setHoveredMovieId,
}: {
  movie: Movie
  movieIndex: number
  handleMovieClick?: (
    movie: Movie,
    event: React.MouseEvent<HTMLDivElement>,
  ) => void
  hoveredMovieId: string | null
  setHoveredMovieId: (id: string | null) => void
}) {
  const posterPath = movie.images?.posters?.[0]?.file_path
  const posterUrl = posterPath ? getImageUrl(posterPath, 'original') : null
  return (
    <div
      key={movie.id}
      className="relative group cursor-pointer animate-scale-in parallax__img touch-manipulation"
      style={{
        animationDelay: `${movieIndex * 0.05}s`,
      }}
      onClick={(e) => handleMovieClick && handleMovieClick(movie, e)}
      onMouseEnter={() => setHoveredMovieId(movie.id)}
      onMouseLeave={() => setHoveredMovieId(null)}
    >
      <div className="aspect-[2/3] relative overflow-hidden rounded-lg sm:rounded-md border border-border shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/50 active:scale-[0.98] active:shadow-inner">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center p-2">
              <div className="text-2xl sm:text-2xl mb-1">🎬</div>
              <p className="text-xs sm:text-[0.65rem] text-muted-foreground line-clamp-2">
                {movie.title}
              </p>
            </div>
          </div>
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 sm:via-black/40 ${
            hoveredMovieId === movie.id
              ? 'opacity-100'
              : 'sm:opacity-0 opacity-100'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2">
            <p className="text-white text-sm sm:text-xs font-semibold line-clamp-2 drop-shadow-md">
              {movie.title}
            </p>
            {movie.releaseDate && (
              <p className="text-white/80 text-xs sm:text-[0.65rem] mt-0.5">
                {new Date(movie.releaseDate).getFullYear()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
