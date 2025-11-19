import { MovieDetailsDialog } from '@/components/shortlists/movie-details-dialog'
import UserTabList from '@/components/shortlists/user-tab-list'
import Toggle from '@/components/ui/toggle'
import { Movie } from '@/db/schema'
import {
  useFinalizeRaffleMutation,
  useStartRaffleMutation,
} from '@/lib/react-query/mutations/raffle'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Dices } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

const searchSchema = z.object({
  dryRun: z.boolean().optional().default(false),
})

export const Route = createFileRoute('/_authenticated/shortlists')({
  validateSearch: (search) => searchSchema.parse(search),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(shortlistQueries.all())
  },
  component: ShortlistsPage,
})

function ShortlistsPage() {
  const { dryRun } = Route.useSearch()
  const navigate = Route.useNavigate()
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

      <motion.div layout className={`flex h-full w-full `}>
        <UserTabList
          onMovieClick={handleMovieClick}
          raffleState={raffleState}
          onRaffleComplete={handleRaffleComplete}
          winningMovie={winningMovie}
          dryRun={dryRun}
          onDryRunChange={(val) =>
            navigate({ search: (prev) => ({ ...prev, dryRun: val }) })
          }
          onStartRaffle={handleRaffleStart}
          watchDate={watchDate}
          onDateSelect={setWatchDate}
        />
      </motion.div>
      <MovieDetailsDialog
        movie={selectedMovie}
        open={dialogOpen}
        triggerRect={triggerRect}
        onClose={handleDialogClose}
      />
    </div>
  )
}
