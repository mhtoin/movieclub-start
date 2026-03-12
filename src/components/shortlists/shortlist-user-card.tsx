import type { ShortlistWithUserMovies } from '@/db/schema'
import type { Movie } from '@/db/schema/movies'
import { getImageUrl } from '@/lib/tmdb-api'
import { CheckCircle2, Film, Plus, Star, XCircle } from 'lucide-react'

function getCardColor(index: number) {
  const hue = (index * 137.5) % 360
  return {
    color: `hsl(${hue}, 70%, 50%)`,
    faint: `hsl(${hue}, 70%, 50%, 0.12)`,
    strip: `hsl(${hue}, 65%, 45%)`,
  }
}

interface Props {
  shortlist: ShortlistWithUserMovies
  colorIndex: number
  onMovieClick: (movie: Movie, rect: DOMRect) => void
  delay?: number
}

function MovieRow({
  movie,
  position,
  onMovieClick,
  cardIndex = 0,
}: {
  movie: Movie
  position: number
  onMovieClick: (movie: Movie, e: React.MouseEvent<HTMLDivElement>) => void
  cardIndex?: number
}) {
  const posterPath = movie.images?.posters?.[0]?.file_path
  const posterUrl = posterPath ? getImageUrl(posterPath, 'w185') : null
  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null
  const genres = movie.genres?.slice(0, 2) ?? []
  const rating = movie.voteAverage
    ? Math.round(movie.voteAverage * 10) / 10
    : null
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null

  return (
    <div
      className="flex gap-3 p-3 cursor-pointer group hover:bg-accent/40 transition-colors duration-150 rounded-xl mx-1"
      onClick={(e) => onMovieClick(movie, e)}
    >
      <div className="relative w-12 flex-shrink-0 rounded-md overflow-hidden border border-border/50 shadow-sm bg-muted">
        <div className="aspect-[2/3]">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              width={48}
              height={72}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading={cardIndex === 0 && position === 1 ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-4 h-4 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center">
          <span className="text-[9px] font-bold text-white leading-none">
            {position}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {year && (
            <span className="text-xs text-muted-foreground">{year}</span>
          )}
          {runtime && (
            <span className="text-xs text-muted-foreground/70">{runtime}</span>
          )}
          {rating !== null && (
            <span className="flex items-center gap-0.5 text-xs text-amber-500 font-medium">
              <Star className="w-3 h-3 fill-amber-500" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        {genres.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {genres.map((g) => (
              <span
                key={g}
                className="text-[10px] bg-muted/70 text-muted-foreground rounded-full px-2 py-0.5 leading-none"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyMovieRow({ position }: { position: number }) {
  return (
    <div className="flex gap-3 px-3 py-3 mx-1">
      <div className="w-12 flex-shrink-0 rounded-md border-2 border-dashed border-border/30 bg-muted/10 flex items-center justify-center">
        <div className="aspect-[2/3] w-full flex items-center justify-center">
          <Plus className="w-4 h-4 text-muted-foreground/25" />
        </div>
      </div>
      <div className="flex-1 flex items-center">
        <p className="text-xs text-muted-foreground/40 italic">
          Empty slot {position}
        </p>
      </div>
    </div>
  )
}

export function ShortlistUserCard({
  shortlist,
  colorIndex,
  onMovieClick,
  delay = 0,
}: Props) {
  const { user, movies, isReady, participating } = shortlist
  const { color, faint, strip } = getCardColor(colorIndex)

  const handleMovieClick = (
    movie: Movie,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    onMovieClick(movie, e.currentTarget.getBoundingClientRect())
  }

  return (
    <div
      className={`rounded-2xl bg-card border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col animate-fade-in ${
        !participating ? 'opacity-55' : ''
      }`}
      style={{ borderColor: `${color}45`, animationDelay: `${delay}s` }}
    >
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${strip}, ${color}60)` }}
      />
      <div
        className="flex items-center gap-3 px-4 pt-3.5 pb-3"
        style={{ borderBottom: `1px solid ${color}20`, background: faint }}
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            width={44}
            height={44}
            className={`w-11 h-11 rounded-full border-2 flex-shrink-0 ${
              !participating ? 'grayscale' : ''
            }`}
            style={{ borderColor: color }}
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
            style={{ background: color }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p
            className={`font-bold text-base leading-tight truncate ${
              !participating
                ? 'text-muted-foreground line-through'
                : 'text-foreground'
            }`}
          >
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {movies.length} of 3 picks
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {!participating ? (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70 bg-muted/60 rounded-full px-2.5 py-1 font-medium">
              <XCircle className="w-3 h-3" />
              Sitting out
            </span>
          ) : (
            <span
              className={`flex items-center gap-1 text-[11px] rounded-full px-2.5 py-1 font-semibold border ${
                isReady
                  ? 'text-success bg-success/10 border-success/30'
                  : 'text-muted-foreground bg-muted/50 border-transparent'
              }`}
            >
              {isReady ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Ready
                </>
              ) : (
                'Not ready'
              )}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col py-1.5 flex-1">
        {Array.from({ length: 3 }).map((_, idx) => {
          const film = movies[idx] as Movie | undefined
          return film ? (
            <MovieRow
              key={film.id}
              movie={film}
              position={idx + 1}
              cardIndex={colorIndex}
              onMovieClick={handleMovieClick}
            />
          ) : (
            <EmptyMovieRow key={`empty-${idx}`} position={idx + 1} />
          )
        })}
      </div>
    </div>
  )
}
