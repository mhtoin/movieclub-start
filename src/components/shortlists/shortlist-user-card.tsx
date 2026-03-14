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
    <div
      className="flex items-center gap-3 p-2 rounded-md border border-transparent hover:translate-x-1 transition-all duration-200 cursor-pointer group bg-[var(--ticket-movie-bg)] hover:bg-[var(--ticket-movie-bg-hover)] hover:border-[var(--ticket-movie-border-hover)]"
      onClick={(e) => onMovieClick(movie, e)}
    >
      <div className="relative w-10 h-14 rounded-sm overflow-hidden flex-shrink-0 bg-[var(--ticket-poster-bg)]">
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
        <p className="text-sm whitespace-nowrap overflow-hidden text-ellipsis mb-0.5 tracking-wide uppercase font-[var(--font-cinema)] text-[var(--ticket-title)]">
          {movie.title}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-[var(--ticket-meta)]">
          {year && <span>{year}</span>}
          {runtime && <span>{runtime}</span>}
          {rating !== null && (
            <span className="flex items-center gap-0.5 font-medium text-[var(--ticket-rating)]">
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
    <div className="flex items-center gap-2.5 p-2 rounded-md border border-dashed bg-[var(--ticket-empty-bg)] border-[var(--ticket-empty-border)]">
      <div className="w-10 h-14 flex items-center justify-center bg-[var(--ticket-movie-bg)] rounded-sm text-[var(--ticket-empty-icon)]">
        <Plus className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--ticket-title)] opacity-40">
          Available
        </p>
        <div className="flex items-center gap-2 text-[11px] text-[var(--ticket-meta)] opacity-40">
          <span>Slot {position}</span>
        </div>
      </div>
    </div>
  )
}

function TicketBarcode({ seed }: { seed: string }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=56x56&data=${encodeURIComponent(seed)}&bgcolor=ffffff&color=000000&margin=0`

  return (
    <div className="flex flex-col items-center mt-3">
      <div className="w-12 h-12 rounded-sm overflow-hidden bg-white p-0.5">
        <img src={qrUrl} alt="QR Code" className="w-full h-full" />
      </div>
    </div>
  )
}

function getStubClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 border-r bg-gradient-to-b from-[var(--ticket-stub-empty-bg-start)] to-[var(--ticket-stub-empty-bg-end)] border-[var(--ticket-stub-empty-border)]'
  if (isReady)
    return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 border-r bg-gradient-to-b from-[var(--ticket-stub-ready-bg-start)] to-[var(--ticket-stub-ready-bg-end)] border-[var(--ticket-stub-ready-border)]'
  return 'absolute left-0 top-0 bottom-0 w-[88px] flex flex-col items-center justify-between p-4 border-r bg-gradient-to-b from-[var(--ticket-stub-bg-start)] to-[var(--ticket-stub-bg-end)] border-[var(--ticket-stub-border)]'
}

function getStatusClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'text-[10px] font-bold tracking-[1.5px] uppercase py-1.5 font-[var(--font-cinema)] text-[var(--ticket-stamp-sitting-out)]'
  if (isReady)
    return 'text-[10px] font-bold tracking-[1.5px] uppercase py-1.5 font-[var(--font-cinema)] text-[var(--ticket-stamp-ready)] drop-shadow-[0_0_12px_oklch(0.6_0.15_85/0.5)]'
  return 'text-[10px] font-bold tracking-[1.5px] uppercase py-1.5 font-[var(--font-cinema)] text-[var(--ticket-stub-status)]'
}

function getStampClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'absolute top-3 right-3 px-2.5 py-1 border-2 rounded-sm text-[10px] font-bold tracking-[2px] uppercase font-[var(--font-cinema)] bg-[var(--ticket-empty-bg)]'
  if (isReady)
    return 'absolute top-3 right-3 px-2.5 py-1 border-2 rounded-sm text-[10px] font-bold tracking-[2px] uppercase font-[var(--font-cinema)] text-[var(--ticket-stamp-ready)] border-[var(--ticket-stamp-ready)] bg-[var(--ticket-stub-ready-bg-start)] shadow-[0_0_0_1px_oklch(0.75_0.15_85/0.3),0_0_12px_oklch(0.6_0.15_85/0.2)_inset] drop-shadow-[0_0_8px_oklch(0.6_0.15_85/0.4)]'
  return 'absolute top-3 right-3 px-2.5 py-1 border-2 rounded-sm text-[10px] font-bold tracking-[2px] uppercase font-[var(--font-cinema)] text-[var(--ticket-stamp-not-ready)] border-[var(--ticket-stamp-not-ready)] bg-[var(--ticket-movie-bg)]'
}

function getStampText(participating: boolean, isReady: boolean) {
  if (!participating) return 'Out'
  if (isReady) return 'Ready'
  return 'Wait'
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

  return (
    <div
      className="ticket-card relative rounded overflow-hidden transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:rotate-[-0.3deg] hover:shadow-[0_12px_24px_rgba(0,0,0,0.25),0_24px_48px_rgba(0,0,0,0.15)] cursor-pointer animate-ticket-print bg-gradient-to-br from-[var(--ticket-bg-start)] to-[var(--ticket-bg-end)]"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className="absolute top-0 bottom-0 left-[88px] w-px opacity-50"
        style={{
          background:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 10px, var(--ticket-perforation) 10px, var(--ticket-perforation) 14px)',
        }}
      />
      <div className={getStubClass(participating, isReady)}>
        <div className="flex flex-col items-center">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              width={44}
              height={44}
              className={`w-11 h-11 rounded-full border-2 border-[var(--ticket-stub-avatar-border)] mb-2 ${
                !participating ? 'grayscale opacity-50' : ''
              }`}
              loading={colorIndex < 6 ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : (
            <div
              className={`w-11 h-11 rounded-full border-2 border-[var(--ticket-stub-avatar-border)] mb-2 flex items-center justify-center font-bold text-lg text-[var(--ticket-placeholder-fg)] bg-[var(--ticket-placeholder-bg)] ${
                !participating ? 'grayscale opacity-50' : ''
              }`}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-[8px] uppercase tracking-[0.5px] font-[var(--font-cinema)] text-[var(--ticket-stub-label)]">
            Member
          </span>
          <p
            className={`text-[11px] font-semibold text-center break-words leading-[1.3] mt-1 max-w-[60px] text-[var(--ticket-stub-name)] ${
              !participating ? 'line-through opacity-50' : ''
            }`}
          >
            {user.name}
          </p>
        </div>
        <TicketBarcode seed={`${user.id}-${colorIndex}`} />
      </div>

      <div className="relative ml-[88px] p-4 min-h-[160px]">
        <div
          className={getStampClass(participating, isReady)}
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(12deg)',
          }}
        >
          {getStampText(participating, isReady)}
        </div>

        <div className="flex flex-col gap-2.5">
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
