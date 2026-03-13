import type { ShortlistWithUserMovies } from '@/db/schema'
import type { Movie } from '@/db/schema/movies'
import { getResponsiveImageProps } from '@/lib/tmdb-api'
import { Film, Plus, Star } from 'lucide-react'

interface Props {
  shortlist: ShortlistWithUserMovies
  colorIndex: number
  onMovieClick: (movie: Movie, rect: DOMRect) => void
  delay?: number
}

function TicketMovieRow({
  movie,
  position,
  onMovieClick,
}: {
  movie: Movie
  position: number
  onMovieClick: (movie: Movie, e: React.MouseEvent<HTMLDivElement>) => void
}) {
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

  return (
    <div className="ticket-movie group" onClick={(e) => onMovieClick(movie, e)}>
      <div className="ticket-movie__poster">
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
        <div className="ticket-movie__number">{position}</div>
      </div>
      <div className="ticket-movie__info">
        <p className="ticket-movie__title">{movie.title}</p>
        <div className="ticket-movie__meta">
          {year && <span>{year}</span>}
          {runtime && <span>{runtime}</span>}
          {rating !== null && (
            <span className="ticket-movie__rating">
              <Star className="w-3 h-3 fill-current" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function TicketEmptyRow({ position }: { position: number }) {
  return (
    <div className="ticket-empty">
      <div className="ticket-empty__icon">
        <Plus className="w-4 h-4" />
      </div>
      <div className="ticket-movie__info">
        <p className="ticket-movie__title opacity-40">Available</p>
        <div className="ticket-movie__meta opacity-40">
          <span>Slot {position}</span>
        </div>
      </div>
    </div>
  )
}

function TicketBarcode({ seed }: { seed: string }) {
  const bars = Array.from({ length: 20 }, (_, i) => {
    const hash = seed.charCodeAt(i % seed.length) + i * 7
    return 2 + (hash % 5)
  })

  return (
    <div className="ticket-barcode">
      {bars.map((height, i) => (
        <div
          key={i}
          className="ticket-barcode__bar"
          style={{ height: `${height}px` }}
        />
      ))}
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

  const handleMovieClick = (
    movie: Movie,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    onMovieClick(movie, e.currentTarget.getBoundingClientRect())
  }

  const getStubClass = () => {
    if (!participating) return 'ticket-card__stub ticket-card__stub--empty'
    if (isReady) return 'ticket-card__stub ticket-card__stub--ready'
    return 'ticket-card__stub'
  }

  const getStatusClass = () => {
    if (!participating)
      return 'ticket-stub__status ticket-stub__status--sitting-out'
    if (isReady) return 'ticket-stub__status ticket-stub__status--ready'
    return 'ticket-stub__status'
  }

  const getStampClass = () => {
    if (!participating) return 'ticket-stamp ticket-stamp--sitting-out'
    if (isReady) return 'ticket-stamp ticket-stamp--ready'
    return 'ticket-stamp ticket-stamp--not-ready'
  }

  const getStampText = () => {
    if (!participating) return 'Out'
    if (isReady) return 'Ready'
    return 'Wait'
  }

  return (
    <div
      className="ticket-card animate-ticket-print group cursor-pointer"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="ticket-card__notch-left" />
      <div className="ticket-card__notch-right" />
      <div className="ticket-card__perforation" />

      <div className={getStubClass()}>
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            width={44}
            height={44}
            className={`ticket-stub__avatar ${
              !participating ? 'grayscale opacity-50' : ''
            }`}
            loading={colorIndex < 6 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <div
            className={`ticket-stub__avatar ticket-stub__avatar--placeholder ${
              !participating ? 'grayscale opacity-50' : ''
            }`}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="ticket-stub__label">Member</span>
        <p
          className={`ticket-stub__name ${
            !participating ? 'line-through opacity-50' : ''
          }`}
        >
          {user.name}
        </p>
        <span className="ticket-stub__count">{movies.length}/3 picks</span>
        <div className={getStatusClass()}>
          {!participating ? 'Sitting Out' : isReady ? 'Ready' : 'Pending'}
        </div>
        <TicketBarcode seed={`${user.id}-${colorIndex}`} />
      </div>

      <div className="ticket-card__content">
        <div className={getStampClass()}>{getStampText()}</div>

        <div className="ticket-card__movies">
          {Array.from({ length: 3 }).map((_, idx) => {
            const film = movies[idx] as Movie | undefined
            return film ? (
              <TicketMovieRow
                key={film.id}
                movie={film}
                position={idx + 1}
                onMovieClick={handleMovieClick}
              />
            ) : (
              <TicketEmptyRow key={`empty-${idx}`} position={idx + 1} />
            )
          })}
        </div>
      </div>
    </div>
  )
}
