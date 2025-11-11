import { MovieDetailsDialog } from '@/components/shortlists/movie-details-dialog'
import { ShortlistCard } from '@/components/shortlists/shortlist-card'
import { Button } from '@/components/ui/button'
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

  const readyCount = shortlists.filter(
    (s) => s.isReady && s.participating,
  ).length
  const totalCount = shortlists.filter((s) => s.participating).length
  const movieCount = shortlists.reduce(
    (acc, s) => acc + (s.participating ? s.movies.length : 0),
    0,
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 border-b border-border flex flex-col lg:flex-row justify-between items-center p-4  shadow-md">
        <h1 className="text-4xl font-bold text-foreground mb-2">Shortlists</h1>
        <div className="flex items-center justify-center bg-card rounded-lg p-4 gap-4 shadow-md border border-border">
          <span className="text-xs lg:text-base rounded-full bg-secondary/70 px-2 py-1 lg:px-4 lg:py-2">{`Ready: ${readyCount} / ${totalCount}`}</span>
          <span className="text-xs lg:text-base rounded-full bg-secondary/70 px-2 py-1 lg:px-4 lg:py-2">{`Movies: ${movieCount}`}</span>
          <Button variant={'primary'}>Raffle</Button>
        </div>
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
