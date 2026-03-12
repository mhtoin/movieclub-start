import type { Movie } from '@/db/schema/movies'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { Suspense, lazy, useState } from 'react'
import { ShortlistUserCard } from './shortlist-user-card'

const MovieDetailsDialog = lazy(() =>
  import('./movie-details-dialog').then((m) => ({
    default: m.MovieDetailsDialog,
  })),
)

export function ShortlistOverviewGrid() {
  const { data: shortlists } = useSuspenseQuery(shortlistQueries.all())
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleMovieClick = (movie: Movie, rect: DOMRect) => {
    setSelectedMovie(movie)
    setTriggerRect(rect)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setTimeout(() => {
      setSelectedMovie(null)
      setTriggerRect(null)
    }, 400)
  }

  const totalMovies = shortlists.reduce((acc, s) => acc + s.movies.length, 0)
  const readyCount = shortlists.filter(
    (s) => s.isReady && s.participating,
  ).length

  if (shortlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">
            No shortlists yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Members can add movies to their shortlists using the toolbar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {shortlists.length}
          </span>{' '}
          {shortlists.length === 1 ? 'member' : 'members'}
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalMovies}</span>{' '}
          movies total
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-success">{readyCount}</span> ready
          to raffle
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {shortlists.map((shortlist, index) => (
          <ShortlistUserCard
            key={shortlist.id}
            shortlist={shortlist}
            colorIndex={index}
            onMovieClick={handleMovieClick}
            delay={index * 0.06}
          />
        ))}
      </div>
      <Suspense fallback={null}>
        <MovieDetailsDialog
          movie={selectedMovie}
          open={dialogOpen}
          triggerRect={triggerRect}
          onClose={handleDialogClose}
        />
      </Suspense>
    </>
  )
}
