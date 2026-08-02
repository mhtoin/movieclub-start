import { ChevronRight } from 'lucide-react'
import type { ShortlistWithUserMovies } from '@/db/schema'
import type { Movie } from '@/db/schema/movies'
import Avatar from '@/components/ui/avatar'
import { TicketCard } from '@/components/ticket/ticket-card'
import { TicketEmptyRow } from '@/components/ticket/ticket-empty-row'
import { TicketMovieRow } from '@/components/ticket/ticket-movie-row'

interface Props {
  shortlist: ShortlistWithUserMovies
  colorIndex: number
  onMovieClick: (movie: Movie, rect: DOMRect) => void
  delay?: number
}

export function StubShortlistCard({
  shortlist,
  colorIndex,
  onMovieClick,
  delay = 0,
}: Props) {
  const { movies, user, isReady, participating } = shortlist
  const status = !participating
    ? 'Not participating'
    : isReady
      ? 'Ready'
      : 'In progress'

  return (
    <TicketCard
      delay={delay}
      className="animate-shortlist-card-enter group p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            src={user.image}
            alt={user.name}
            name={user.name}
            size={38}
            className={!participating ? 'grayscale opacity-50' : ''}
            loading={colorIndex < 6 ? 'eager' : 'lazy'}
            decoding="async"
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {user.name}
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {movies.length} {movies.length === 1 ? 'movie' : 'movies'}{' '}
              shortlisted
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
            !participating
              ? 'bg-muted text-muted-foreground'
              : isReady
                ? 'bg-success/10 text-success'
                : 'bg-primary/10 text-primary'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="my-4 border-t border-dashed border-border/50" />

      <div className="space-y-1">
        {Array.from({ length: 3 }).map((_, index) => {
          const movie = movies[index] as Movie | undefined
          return movie ? (
            <div className="relative" key={movie.id}>
              <span className="pointer-events-none absolute left-0 top-3 z-10 font-mono text-[10px] text-primary">
                0{index + 1}
              </span>
              <div className="pl-5">
                <TicketMovieRow
                  movie={movie}
                  onMovieClick={(selectedMovie, event) =>
                    onMovieClick(
                      selectedMovie,
                      event.currentTarget.getBoundingClientRect(),
                    )
                  }
                  interactive
                />
              </div>
            </div>
          ) : (
            <div className="relative" key={`empty-${index}`}>
              <span className="pointer-events-none absolute left-0 top-5 z-10 font-mono text-[10px] text-primary/60">
                0{index + 1}
              </span>
              <div className="pl-5">
                <TicketEmptyRow position={index + 1} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 border-t border-dashed border-border/50 pt-3">
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.08em] text-muted-foreground">
          <span>SHORTLIST / {String(colorIndex + 1).padStart(2, '0')}A</span>
          <span>{movies.length}/3 FILMS</span>
          <ChevronRight className="size-3 opacity-0 transition-opacity duration-150 group-hover:opacity-60" />
        </div>
      </div>
    </TicketCard>
  )
}
