import { MovieDetailsDialog } from '@/components/shortlists/movie-details-dialog'
import { ShortlistCard } from '@/components/shortlists/shortlist-card'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/shortlists')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(shortlistQueries.all())
  },
  component: ShortlistsPage,
})

function ShortlistsPage() {
  const { data: shortlists } = useSuspenseQuery(shortlistQueries.all())
  const [selectedMovie, setSelectedMovie] = useState<any>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleMovieClick = (movie: any, rect: DOMRect) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Shortlists</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {shortlists.map((shortlistItem, index) => (
          <ShortlistCard
            key={shortlistItem.id}
            shortlist={shortlistItem}
            index={index}
            onMovieClick={handleMovieClick}
          />
        ))}
      </div>

      <MovieDetailsDialog
        movie={selectedMovie}
        open={dialogOpen}
        triggerRect={triggerRect}
        onClose={handleDialogClose}
      />
    </div>
  )
}
