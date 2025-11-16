import { MovieDetailsDialog } from '@/components/shortlists/movie-details-dialog'
import RaffleCarousel from '@/components/shortlists/raffle-carousel'
import { ShortlistCard } from '@/components/shortlists/shortlist-card'
import { Button } from '@/components/ui/button'
import Toggle from '@/components/ui/toggle'
import { Movie } from '@/db/schema'
import {
  useFinalizeRaffleMutation,
  useStartRaffleMutation,
} from '@/lib/react-query/mutations/raffle'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Dices } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/shortlists')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(shortlistQueries.all())
  },
  component: ShortlistsPage,
})

function ShortlistsPage() {
  const { data: shortlists } = useSuspenseQuery(shortlistQueries.all())
  const startRaffleMutation = useStartRaffleMutation()
  const finalizeMutation = useFinalizeRaffleMutation()
  const [selectedMovie, setSelectedMovie] = useState<any>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [raffleState, setRaffleState] = useState<
    'not-started' | 'preview' | 'spinning' | 'winner'
  >('not-started')
  const [winningMovie, setWinningMovie] = useState<Movie | null>(null)

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

  const handleStateToggle = () => {
    if (raffleState === 'not-started') {
      setRaffleState('preview')
    } else {
      setRaffleState('not-started')
      setWinningMovie(null)
    }
  }

  const handleRaffleStart = async () => {
    setRaffleState('spinning')
    try {
      const winner = await startRaffleMutation.mutateAsync()
      setWinningMovie(winner)
      console.log('Raffle started, winning movie:', winner)
    } catch (error) {
      console.error('Failed to start raffle:', error)
      setRaffleState('preview')
    }
  }

  const handleRaffleComplete = async () => {
    setRaffleState('winner')
    if (winningMovie) {
      try {
        await finalizeMutation.mutateAsync(winningMovie.id)
        console.log('Raffle finalized successfully')
      } catch (error) {
        console.error('Failed to finalize raffle:', error)
      }
    }
  }

  const readyCount = shortlists.filter(
    (s) => s.isReady && s.participating,
  ).length
  const totalCount = shortlists.filter((s) => s.participating).length
  const movieCount = shortlists.reduce(
    (acc, s) => acc + (s.participating ? s.movies.length : 0),
    0,
  )
  const movies = shortlists.reduce(
    (acc, s) => acc.concat(s.participating ? s.movies : []),
    [] as Movie[],
  )

  return (
    <div className="container mx-auto px-4 py-2 relative">
      <div className="mb-8 border-b border-border flex flex-col lg:flex-row justify-between items-center p-4  shadow-md">
        <h1 className="text-4xl font-bold text-foreground mb-2">Shortlists</h1>
        <div className="flex items-center justify-center  rounded-lg p-4 gap-4">
          <span className="text-secondary-foreground text-xs lg:text-base rounded-full bg-secondary/70 px-2 py-1 lg:px-4 lg:py-2">{`Ready: ${readyCount} / ${totalCount}`}</span>
          <span className="text-secondary-foreground text-xs lg:text-base rounded-full bg-secondary/70 px-2 py-1 lg:px-4 lg:py-2">{`Movies: ${movieCount}`}</span>
          <Toggle
            pressedIcon={<Dices className="h-5 w-5" />}
            unpressedIcon={<Dices className="h-5 w-5" />}
            onPressedChange={handleStateToggle}
            variant="default"
            size="default"
            aria-label="Toggle Raffle Mode"
          />
        </div>
      </div>

      <motion.div
        layout
        className={`flex flex-wrap gap-6 p-4 mb-4 items-center justify-between`}
      >
        <div className="flex gap-4 w-fit flex-wrap">
          {shortlists.map((shortlistItem, index) => (
            <ShortlistCard
              key={shortlistItem.id}
              shortlist={shortlistItem}
              index={index}
              onMovieClick={handleMovieClick}
              raffleState={raffleState}
            />
          ))}
        </div>
        <AnimatePresence>
          {raffleState !== 'not-started' && (
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={handleRaffleStart}
              disabled={raffleState !== 'preview' || movies.length === 0}
            >
              <Dices className="h-4 w-4" />
              Start Raffle
            </Button>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {raffleState !== 'not-started' && (
          <>
            <RaffleCarousel
              movies={movies}
              raffleState={raffleState}
              winningMovie={winningMovie}
              onRaffleComplete={handleRaffleComplete}
            />
          </>
        )}
      </AnimatePresence>
      <MovieDetailsDialog
        movie={selectedMovie}
        open={dialogOpen}
        triggerRect={triggerRect}
        onClose={handleDialogClose}
      />
    </div>
  )
}
