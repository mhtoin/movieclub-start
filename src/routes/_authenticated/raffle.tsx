import { PageTitleBar } from '@/components/page-titlebar'
import { MovieSelectionModal } from '@/components/raffle/movie-selection-modal'
import { ParticipantTicket } from '@/components/raffle/participant-ticket'
import { RaffleControlBar } from '@/components/raffle/raffle-control-bar'
import { RaffleCountdown } from '@/components/raffle/raffle-countdown'
import { RaffleSpinner } from '@/components/raffle/raffle-spinner'
import { RaffleWinner } from '@/components/raffle/raffle-winner'
import { ShortlistsSkeleton } from '@/components/shortlists/shortlists-skeleton'
import type { ShortlistWithUserMovies } from '@/db/schema'
import type { Movie } from '@/db/schema/movies'
import {
  useFinalizeRaffleMutation,
  useStartRaffleMutation,
} from '@/lib/react-query/mutations/raffle'
import {
  useUpdateUserSelectedIndexMutation,
  useUpdateUserShortlistStatusMutation,
} from '@/lib/react-query/mutations/shortlist'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Suspense, useMemo, useRef, useState } from 'react'

export const Route = createFileRoute('/_authenticated/raffle')({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(shortlistQueries.all())
  },
  component: RafflePage,
})

type Phase = 'setup' | 'countdown' | 'spinning' | 'winner'

function RafflePage() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [watchDate, setWatchDate] = useState<Date | undefined>(undefined)
  const [dryRun, setDryRun] = useState(false)
  const [winningMovie, setWinningMovie] = useState<Movie | null>(null)
  const [winningUserId, setWinningUserId] = useState<string | null>(null)
  const [winningCredits, setWinningCredits] = useState<{
    cast: Array<any> | null
    crew: Array<any> | null
  } | null>(null)
  const [selectedShortlist, setSelectedShortlist] =
    useState<ShortlistWithUserMovies | null>(null)
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)

  const startMutation = useStartRaffleMutation()
  const finalizeMutation = useFinalizeRaffleMutation()
  const updateStatusMutation = useUpdateUserShortlistStatusMutation()
  const updateSelectedIndexMutation = useUpdateUserSelectedIndexMutation()

  const pendingDraw = useRef<Promise<{
    movie: Movie
    userId: string
    cast: Array<any> | null
    crew: Array<any> | null
  }> | null>(null)

  const { data: shortlists = [] } = useQuery(shortlistQueries.all())
  const participatingMovies = useMemo(
    () => shortlists.filter((s) => s.participating).flatMap((s) => s.movies),
    [shortlists],
  )
  const winnerUser = useMemo(
    () =>
      winningUserId
        ? (shortlists.find((s) => s.user.id === winningUserId)?.user ?? null)
        : null,
    [shortlists, winningUserId],
  )

  const participating = useMemo(
    () => shortlists.filter((s) => s.participating),
    [shortlists],
  )
  const readyCount = useMemo(
    () => shortlists.filter((s) => s.isReady && s.participating).length,
    [shortlists],
  )

  const pendingSelections = useMemo(
    () =>
      participating.filter(
        (s) => s.requiresSelection && s.selectedIndex === null,
      ),
    [participating],
  )

  const canStart = useMemo(
    () =>
      !!watchDate &&
      readyCount === participating.length &&
      participating.length > 0 &&
      pendingSelections.length === 0,
    [watchDate, readyCount, participating.length, pendingSelections.length],
  )

  const handleToggleReady = (userId: string, current: boolean) => {
    updateStatusMutation.mutate({ userId, isReady: !current })
  }

  const handleToggleParticipating = (userId: string, current: boolean) => {
    updateStatusMutation.mutate({ userId, participating: !current })
  }

  const handleStartRaffle = () => {
    pendingDraw.current = startMutation.mutateAsync()
    setPhase('countdown')
  }

  const handleCountdownComplete = async () => {
    try {
      const result = await (pendingDraw.current ?? startMutation.mutateAsync())
      setWinningMovie(result.movie)
      setWinningUserId(result.userId)
      setWinningCredits({
        cast: result.cast ?? null,
        crew: result.crew ?? null,
      })
      setPhase('spinning')
    } catch {
      setPhase('setup')
    } finally {
      pendingDraw.current = null
    }
  }

  const handleSpinComplete = () => {
    setPhase('winner')
  }

  const handleFinalize = async () => {
    if (!winningMovie || !winningUserId) return
    if (!dryRun) {
      if (!watchDate) return
      await finalizeMutation.mutateAsync({
        movieId: winningMovie.id,
        watchDate,
        userId: winningUserId,
      })
    }
    setPhase('setup')
    setWinningMovie(null)
    setWinningUserId(null)
    setWinningCredits(null)
  }

  const handleRerun = () => {
    setPhase('setup')
    setWinningMovie(null)
    setWinningUserId(null)
    setWinningCredits(null)
  }

  const handleOpenSelectionModal = (shortlist: ShortlistWithUserMovies) => {
    setSelectedShortlist(shortlist)
    setIsSelectionModalOpen(true)
  }

  const handleSelectMovie = (index: number) => {
    if (!selectedShortlist) return
    updateSelectedIndexMutation.mutate(
      { userId: selectedShortlist.user.id, selectedIndex: index },
      {
        onSuccess: () => {
          setIsSelectionModalOpen(false)
          setSelectedShortlist(null)
        },
      },
    )
  }

  return (
    <div className="min-h-full flex flex-col px-2 sm:px-4 py-2 relative container mx-auto pb-24">
      <Link
        to="/shortlists"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Shortlists
      </Link>
      <PageTitleBar title="Raffle" description="Draw next time's movie" />
      {phase === 'setup' && (
        <div className="flex-1 py-6 space-y-6">
          {pendingSelections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-warning/15 border border-warning/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Selection Required Before Raffle
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    The following participants won last time and need to select
                    1 movie for the raffle:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pendingSelections.map((s) => (
                      <button
                        key={s.user.id}
                        onClick={() => handleOpenSelectionModal(s)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent transition-all text-sm"
                      >
                        {s.user.image ? (
                          <img
                            src={s.user.image}
                            alt={s.user.name}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {s.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{s.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Select movie
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <Suspense fallback={<ShortlistsSkeleton />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shortlists.map((shortlist, index) => (
                <ParticipantTicket
                  key={shortlist.id}
                  shortlist={shortlist}
                  colorIndex={index}
                  onToggleReady={() =>
                    handleToggleReady(shortlist.user.id, shortlist.isReady)
                  }
                  onToggleParticipating={() =>
                    handleToggleParticipating(
                      shortlist.user.id,
                      shortlist.participating,
                    )
                  }
                  isUpdating={
                    updateStatusMutation.isPending &&
                    updateStatusMutation.variables?.userId === shortlist.user.id
                  }
                  delay={index * 0.06}
                />
              ))}
            </div>
          </Suspense>
          <RaffleControlBar
            watchDate={watchDate}
            onDateSelect={setWatchDate}
            dryRun={dryRun}
            onDryRunChange={setDryRun}
            onStartRaffle={handleStartRaffle}
            canStart={canStart}
            readyCount={readyCount}
            totalCount={participating.length}
          />
        </div>
      )}
      <AnimatePresence>
        {phase === 'countdown' && (
          <RaffleCountdown onComplete={handleCountdownComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'spinning' &&
          winningMovie &&
          participatingMovies.length > 0 && (
            <RaffleSpinner
              movies={participatingMovies}
              winningMovie={winningMovie}
              onSpinComplete={handleSpinComplete}
            />
          )}
      </AnimatePresence>
      <AnimatePresence>
        {phase === 'winner' && winningMovie && (
          <RaffleWinner
            movie={winningMovie}
            credits={winningCredits}
            winnerUser={winnerUser}
            watchDate={watchDate}
            dryRun={dryRun}
            onFinalize={handleFinalize}
            onRerun={handleRerun}
            isLoading={finalizeMutation.isPending}
          />
        )}
      </AnimatePresence>
      <MovieSelectionModal
        shortlist={selectedShortlist}
        open={isSelectionModalOpen}
        onOpenChange={setIsSelectionModalOpen}
        onSelect={handleSelectMovie}
        isLoading={updateSelectedIndexMutation.isPending}
      />
    </div>
  )
}
