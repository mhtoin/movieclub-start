import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, useState } from 'react'
import { z } from 'zod'

import { PageTitleBar } from '@/components/page-titlebar'
import { MovieDetailsDialog } from '@/components/shortlists/movie-details-dialog'
import { RaffleControlPanel } from '@/components/shortlists/raffle-control-panel'
import { ShortlistsSkeleton } from '@/components/shortlists/shortlists-skeleton'
import UserTabList from '@/components/shortlists/user-tab-list'
import type { Movie } from '@/db/schema'
import {
  useFinalizeRaffleMutation,
  useStartRaffleMutation,
} from '@/lib/react-query/mutations/raffle'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'

const searchSchema = z.object({
  dryRun: z.boolean().optional().default(false),
})

export const Route = createFileRoute('/_authenticated/shortlists')({
  validateSearch: (search) => searchSchema.parse(search),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(shortlistQueries.all())
  },
  component: ShortlistsPage,
})

function ShortlistsPage() {
  const { dryRun } = Route.useSearch()
  const navigate = Route.useNavigate()
  const startRaffleMutation = useStartRaffleMutation()
  const finalizeMutation = useFinalizeRaffleMutation()
  const [selectedMovie, setSelectedMovie] = useState<any>(null)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [raffleState, setRaffleState] = useState<
    'not-started' | 'preview' | 'spinning' | 'winner'
  >('not-started')
  const [winningMovie, setWinningMovie] = useState<Movie | null>(null)
  const [winningUserId, setWinningUserId] = useState<string | null>(null)
  const [watchDate, setWatchDate] = useState<Date | undefined>(undefined)

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
      setWinningUserId(null)
    }
  }

  const handleRaffleStart = async () => {
    setRaffleState('spinning')
    try {
      const { movie, userId } = await startRaffleMutation.mutateAsync()
      setWinningMovie(movie)
      setWinningUserId(userId)
      console.log('Raffle started, winning movie:', movie)
    } catch (error) {
      console.error('Failed to start raffle:', error)
      setRaffleState('preview')
    }
  }

  const handleRaffleComplete = async () => {
    setRaffleState('winner')
    if (winningMovie && winningUserId) {
      if (dryRun) {
        console.log('Dry run: Raffle finalized (simulated)')
        return
      }
      if (!watchDate) {
        console.error('No watch date selected')
        return
      }
      try {
        await finalizeMutation.mutateAsync({
          movieId: winningMovie.id,
          watchDate,
          userId: winningUserId,
        })
        console.log('Raffle finalized successfully')
      } catch (error) {
        console.error('Failed to finalize raffle:', error)
      }
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-2 relative overflow-hidden">
      <PageTitleBar
        title="Shortlists"
        description="Browse member shortlists and run a raffle"
      />
      <motion.div
        layout
        className={`flex flex-col h-full w-full overflow-hidden`}
      >
        <Suspense fallback={<ShortlistsSkeleton />}>
          <UserTabList
            onMovieClick={handleMovieClick}
            raffleState={raffleState}
            onRaffleComplete={handleRaffleComplete}
            winningMovie={winningMovie}
            onRaffleModeToggle={handleStateToggle}
          />
        </Suspense>
      </motion.div>
      <MovieDetailsDialog
        movie={selectedMovie}
        open={dialogOpen}
        triggerRect={triggerRect}
        onClose={handleDialogClose}
      />
      <AnimatePresence>
        {raffleState !== 'not-started' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw] sm:max-w-none"
          >
            <RaffleControlPanel
              onStartRaffle={handleRaffleStart}
              onClose={handleStateToggle}
              watchDate={watchDate}
              onDateSelect={setWatchDate}
              dryRun={dryRun}
              onDryRunChange={(val: boolean) =>
                navigate({ search: (prev) => ({ ...prev, dryRun: val }) })
              }
              isSpinning={raffleState === 'spinning'}
              hasWinner={raffleState === 'winner'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
