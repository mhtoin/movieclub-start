import { XCircle } from 'lucide-react'
import type { ShortlistWithUserMovies } from '@/db/schema'
import type { Movie } from '@/db/schema/movies'
import Avatar from '@/components/ui/avatar'
import { TicketCard } from '@/components/ticket/ticket-card'
import { TicketEmptyRow } from '@/components/ticket/ticket-empty-row'
import { TicketMovieRow } from '@/components/ticket/ticket-movie-row'

interface Props {
  shortlist: ShortlistWithUserMovies
  colorIndex: number
  onToggleReady: () => void
  onToggleParticipating: () => void
  onSelectMovie?: (movieIndex: number) => void
  isUpdating?: boolean
  isSelecting?: boolean
  delay?: number
}

export function StubParticipantTicket({
  shortlist,
  colorIndex,
  onToggleReady,
  onToggleParticipating,
  onSelectMovie,
  isUpdating = false,
  isSelecting = false,
  delay = 0,
}: Props) {
  const { movies, user, isReady, participating, selectedIndex } = shortlist
  const requiresSelection = shortlist.requiresSelection ?? false
  const status = !participating
    ? 'Not participating'
    : isReady
      ? 'Ready'
      : 'In progress'

  const handleStampClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (participating) onToggleReady()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggleParticipating}
        className={`absolute -left-1.5 -top-1.5 z-10 flex size-6 items-center justify-center rounded-full shadow-sm transition-transform duration-150 fine-hover:hover:scale-110 ${
          participating
            ? 'bg-success/20 text-success hover:bg-success/40'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
        title={
          participating
            ? 'Click to exclude from raffle'
            : 'Click to include in raffle'
        }
        aria-label={participating ? 'Exclude from raffle' : 'Include in raffle'}
      >
        <XCircle className="size-4" />
      </button>
      <div
        className={`${participating ? '' : 'opacity-60'} ${isUpdating ? 'opacity-80' : ''}`}
        role={participating && !isReady ? 'button' : undefined}
        tabIndex={participating && !isReady ? 0 : undefined}
        onClick={participating && !isReady ? onToggleReady : undefined}
        onKeyDown={
          participating && !isReady
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onToggleReady()
                }
              }
            : undefined
        }
      >
        <TicketCard
          delay={delay}
          participating={participating}
          className={`animate-ticket-print group p-4 sm:p-5 ${isUpdating ? 'animate-pulse' : ''}`}
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
            <button
              type="button"
              onClick={handleStampClick}
              disabled={!participating}
              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                !participating
                  ? 'bg-muted text-muted-foreground'
                  : isReady
                    ? 'bg-success/10 text-success'
                    : 'bg-primary/10 text-primary'
              } cursor-pointer disabled:cursor-default`}
            >
              {status}
            </button>
          </div>

          <div className="my-4 border-t border-dashed border-border/50" />

          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, index) => {
              const movie = movies[index] as Movie | undefined
              const isMovieSelected =
                requiresSelection && selectedIndex === index

              return movie ? (
                <div className="relative" key={movie.id}>
                  <span className="pointer-events-none absolute left-0 top-3 z-10 font-mono text-[10px] text-primary">
                    0{index + 1}
                  </span>
                  <div className="pl-5">
                    <TicketMovieRow
                      movie={movie}
                      isSelected={isMovieSelected}
                      showSelection={requiresSelection}
                      onSelect={
                        onSelectMovie ? () => onSelectMovie(index) : undefined
                      }
                      isLoading={isSelecting}
                      interactive={!!onSelectMovie && requiresSelection}
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
              <span>
                SHORTLIST / {String(colorIndex + 1).padStart(2, '0')}A
              </span>
              <span>{movies.length}/3 FILMS</span>
            </div>
          </div>
        </TicketCard>
      </div>
    </div>
  )
}
