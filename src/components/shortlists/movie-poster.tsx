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
  const posterUrl = posterPath ? getImageUrl(posterPath, 'w500') : null
  return (
    <div
      key={movie.id}
      className="relative group cursor-pointer animate-scale-in parallax__img"
      style={{
        animationDelay: `${movieIndex * 0.05}s`,
      }}
      onClick={(e) => handleMovieClick && handleMovieClick(movie, e)}
      onMouseEnter={() => setHoveredMovieId(movie.id)}
      onMouseLeave={() => setHoveredMovieId(null)}
    >
      <div className="aspect-[2/3] relative overflow-hidden rounded-md border border-border shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/50">
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
              <div className="text-2xl mb-1">🎬</div>
              <p className="text-[0.65rem] text-muted-foreground line-clamp-2">
                {movie.title}
              </p>
            </div>
          </div>
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
            hoveredMovieId === movie.id ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="text-white text-xs font-semibold line-clamp-2">
              {movie.title}
            </p>
            {movie.releaseDate && (
              <p className="text-white/80 text-[0.65rem] mt-0.5">
                {new Date(movie.releaseDate).getFullYear()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
