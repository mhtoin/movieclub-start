import { XCircle } from 'lucide-react'
import type { ShortlistWithUserMovies } from '@/db/schema'
import type { Movie } from '@/db/schema/movies'
import { TicketCard } from '@/components/ticket/ticket-card'
import { TicketEmptyRow } from '@/components/ticket/ticket-empty-row'
import { TicketMovieRow } from '@/components/ticket/ticket-movie-row'
import { TicketStub } from '@/components/ticket/ticket-stub'

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

export function ParticipantTicket({
  shortlist,
  colorIndex,
  onToggleReady,
  onToggleParticipating,
  onSelectMovie,
  isUpdating = false,
  isSelecting = false,
  delay = 0,
}: Props) {
  const { movies, isReady, participating, selectedIndex } = shortlist
  const requiresSelection = shortlist.requiresSelection ?? false

  const handleStampClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (participating) {
      onToggleReady()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={onToggleParticipating}
        className={`absolute -top-1.5 -left-1.5 z-10 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-sm ${
          participating
            ? 'bg-success/20 text-success hover:bg-success/40 hover:scale-110'
            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-110'
        }`}
        title={
          participating
            ? 'Click to exclude from raffle'
            : 'Click to include in raffle'
        }
      >
        <XCircle className="w-4 h-4" />
      </button>
      <div
        className={`relative ${participating ? '' : 'opacity-60'} ${isUpdating ? 'opacity-80' : ''}`}
        onClick={participating && !isReady ? onToggleReady : undefined}
      >
        <TicketCard
          delay={delay}
          participating={participating}
          className={`animate-ticket-print ${isUpdating ? 'animate-pulse' : ''}`}
        >
          <TicketStub
            shortlist={shortlist}
            colorIndex={colorIndex}
            onStampClick={handleStampClick}
          />

          <div className="relative ml-[88px] p-4 min-h-[160px]">
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 3 }).map((_, idx) => {
                const film = movies[idx] as Movie | undefined
                const isMovieSelected =
                  requiresSelection && selectedIndex === idx
                return film ? (
                  <TicketMovieRow
                    key={film.id}
                    movie={film}
                    isSelected={isMovieSelected}
                    showSelection={requiresSelection}
                    onSelect={
                      onSelectMovie ? () => onSelectMovie(idx) : undefined
                    }
                    isLoading={isSelecting}
                    interactive={!!onSelectMovie && requiresSelection}
                  />
                ) : (
                  <TicketEmptyRow key={`empty-${idx}`} position={idx + 1} />
                )
              })}
            </div>
          </div>
        </TicketCard>
      </div>
    </div>
  )
}
