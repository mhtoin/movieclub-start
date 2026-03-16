import { TicketCard } from '@/components/ticket/ticket-card'
import { TicketEmptyRow } from '@/components/ticket/ticket-empty-row'
import { TicketMovieRow } from '@/components/ticket/ticket-movie-row'
import { TicketStub } from '@/components/ticket/ticket-stub'
import type { ShortlistWithUserMovies } from '@/db/schema'
import type { Movie } from '@/db/schema/movies'

interface Props {
  shortlist: ShortlistWithUserMovies
  colorIndex: number
  onMovieClick: (movie: Movie, rect: DOMRect) => void
  delay?: number
}

export function ShortlistUserCard({
  shortlist,
  colorIndex,
  onMovieClick,
  delay = 0,
}: Props) {
  const { movies } = shortlist

  const handleMovieClick = (
    movie: Movie,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    onMovieClick(movie, e.currentTarget.getBoundingClientRect())
  }

  return (
    <TicketCard delay={delay}>
      <TicketStub shortlist={shortlist} colorIndex={colorIndex} />

      <div className="relative ml-[88px] p-4 min-h-[160px]">
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, idx) => {
            const film = movies[idx] as Movie | undefined
            return film ? (
              <TicketMovieRow
                key={film.id}
                movie={film}
                onMovieClick={handleMovieClick}
                interactive
              />
            ) : (
              <TicketEmptyRow key={`empty-${idx}`} position={idx + 1} />
            )
          })}
        </div>
      </div>
    </TicketCard>
  )
}
