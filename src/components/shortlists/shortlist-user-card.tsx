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
      className="flex items-center gap-3 p-2 bg-[oklch(0.15_0.01_260/0.3)] rounded-md border border-transparent hover:bg-[oklch(0.18_0.02_260/0.5)] hover:border-[oklch(0.4_0.05_260/0.3)] hover:translate-x-1 transition-all duration-200 cursor-pointer group"
      onClick={(e) => onMovieClick(movie, e)}
    >
      <div className="relative w-10 h-14 rounded-sm overflow-hidden flex-shrink-0 bg-[oklch(0.2_0.02_260)]">
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
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[oklch(0.7_0.1_50)] rounded-full flex items-center justify-center text-[9px] font-bold text-[oklch(0.1_0.02_50)] shadow-sm">
          {position}
        </div>
        <div className="absolute inset-0 rounded-sm shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] pointer-events-none" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[oklch(0.95_0.01_260)] whitespace-nowrap overflow-hidden text-ellipsis mb-0.5 tracking-wide uppercase font-[var(--font-cinema)]">
          {movie.title}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-[oklch(0.6_0.02_260)]">
          {year && <span>{year}</span>}
          {runtime && <span>{runtime}</span>}
          {rating !== null && (
            <span className="flex items-center gap-0.5 text-[oklch(0.75_0.15_50)] font-medium">
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
    <div className="flex items-center gap-2.5 p-2 bg-[oklch(0.1_0.01_260/0.2)] rounded-md border border-dashed border-[oklch(0.3_0.02_260/0.3)]">
      <div className="w-10 h-14 flex items-center justify-center bg-[oklch(0.15_0.01_260/0.3)] rounded-sm text-[oklch(0.4_0.02_260)]">
        <Plus className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[oklch(0.95_0.01_260)] opacity-40">
          Available
        </p>
        <div className="flex items-center gap-2 text-[11px] text-[oklch(0.6_0.02_260)] opacity-40">
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
    <div className="flex items-end gap-0.5 h-5 mt-3 px-1">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-0.5 bg-[oklch(0.6_0.02_260/0.5)] rounded-sm"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  )
}

function getStubClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'absolute left-0 top-0 bottom-0 w-[72px] flex flex-col items-center p-4 bg-gradient-to-b from-[oklch(0.25_0.02_260/0.2)] to-[oklch(0.15_0.01_260/0.1)] border-r border-[oklch(0.35_0.02_260/0.3)]'
  if (isReady)
    return 'absolute left-0 top-0 bottom-0 w-[72px] flex flex-col items-center p-4 bg-gradient-to-b from-[oklch(0.65_0.15_85/0.2)] to-[oklch(0.55_0.12_70/0.15)] border-r border-[oklch(0.65_0.15_85/0.4)]'
  return 'absolute left-0 top-0 bottom-0 w-[72px] flex flex-col items-center p-4 bg-gradient-to-b from-[oklch(0.75_0.15_85/0.15)] to-[oklch(0.75_0.15_85/0.08)] border-r border-[oklch(0.75_0.15_85/0.2)]'
}

function getStatusClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'text-[10px] font-bold tracking-[1.5px] uppercase text-[oklch(0.5_0.02_260/0.6)] py-1.5 font-[var(--font-cinema)]'
  if (isReady)
    return 'text-[10px] font-bold tracking-[1.5px] uppercase text-[oklch(0.8_0.15_85)] py-1.5 font-[var(--font-cinema)] drop-shadow-[0_0_12px_oklch(0.6_0.15_85/0.5)]'
  return 'text-[10px] font-bold tracking-[1.5px] uppercase text-[oklch(0.7_0.12_50)] py-1.5 font-[var(--font-cinema)]'
}

function getStampClass(participating: boolean, isReady: boolean) {
  if (!participating)
    return 'absolute top-3 right-3 px-2.5 py-1 border-2 border-[oklch(0.35_0.02_260/0.3)] rounded-sm text-[10px] font-bold tracking-[2px] uppercase font-[var(--font-cinema)] text-[oklch(0.4_0.02_260/0.5)] bg-[oklch(0.12_0.01_260/0.2)]'
  if (isReady)
    return 'absolute top-3 right-3 px-2.5 py-1 border-2 border-[oklch(0.75_0.15_85)] rounded-sm text-[10px] font-bold tracking-[2px] uppercase font-[var(--font-cinema)] text-[oklch(0.75_0.15_85)] bg-[oklch(0.65_0.12_85/0.15)] shadow-[0_0_0_1px_oklch(0.75_0.15_85/0.3),0_0_12px_oklch(0.6_0.15_85/0.2)_inset] drop-shadow-[0_0_8px_oklch(0.6_0.15_85/0.4)]'
  return 'absolute top-3 right-3 px-2.5 py-1 border-2 border-[oklch(0.4_0.02_260/0.4)] rounded-sm text-[10px] font-bold tracking-[2px] uppercase font-[var(--font-cinema)] text-[oklch(0.5_0.03_260/0.7)] bg-[oklch(0.15_0.01_260/0.3)]'
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
      className="relative rounded bg-gradient-to-br from-[oklch(0.12_0.02_260)] to-[oklch(0.08_0.01_260)] overflow-hidden transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:rotate-[-0.3deg] hover:shadow-[0_12px_24px_rgba(0,0,0,0.25),0_24px_48px_rgba(0,0,0,0.15)] cursor-pointer animate-ticket-print"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(115deg, transparent 0%, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%, transparent 100%)',
        }}
      />
      <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 rounded-full bg-background z-[5] pointer-events-none" />
      <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 rounded-full bg-background z-[5] pointer-events-none" />
      <div
        className="absolute top-0 bottom-0 left-[72px] w-px opacity-40"
        style={{
          background:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, oklch(0.4 0.02 260) 6px, oklch(0.4 0.02 260) 8px)',
        }}
      />

      <div className={getStubClass(participating, isReady)}>
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            width={44}
            height={44}
            className={`w-11 h-11 rounded-full border-2 border-[oklch(0.7_0.12_50)] mb-2 ${
              !participating ? 'grayscale opacity-50' : ''
            }`}
            loading={colorIndex < 6 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <div
            className={`w-11 h-11 rounded-full border-2 border-[oklch(0.7_0.12_50)] mb-2 flex items-center justify-center bg-[oklch(0.3_0.05_260)] text-[oklch(0.8_0.02_260)] font-bold text-lg ${
              !participating ? 'grayscale opacity-50' : ''
            }`}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-[8px] text-[oklch(0.5_0.02_260/0.6)] uppercase tracking-[0.5px] font-[var(--font-cinema)]">
          Member
        </span>
        <p
          className={`text-[11px] font-semibold text-[oklch(0.9_0.01_260)] text-center break-words leading-[1.3] mt-1 max-w-[60px] ${
            !participating ? 'line-through opacity-50' : ''
          }`}
        >
          {user.name}
        </p>
        <span className="text-[10px] text-[oklch(0.5_0.02_260/0.7)] mt-auto font-[var(--font-cinema)] tracking-wide">
          {movies.length}/3 picks
        </span>
        <div
          className={getStatusClass(participating, isReady)}
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          {!participating ? 'Sitting Out' : isReady ? 'Ready' : 'Pending'}
        </div>
        <TicketBarcode seed={`${user.id}-${colorIndex}`} />
      </div>

      <div className="relative ml-[72px] p-4 min-h-[160px]">
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
