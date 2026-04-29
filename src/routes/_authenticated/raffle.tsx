import { Suspense, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import type { Movie } from '@/db/schema/movies'
import { PageTitleBar } from '@/components/page-titlebar'
import { ParticipantTicket } from '@/components/raffle/participant-ticket'
import { RaffleControlBar } from '@/components/raffle/raffle-control-bar'
import { RaffleCountdown } from '@/components/raffle/raffle-countdown'
import { RaffleSpinner } from '@/components/raffle/raffle-spinner'
import { RaffleWinner } from '@/components/raffle/raffle-winner'
import { ShortlistsSkeleton } from '@/components/shortlists/shortlists-skeleton'
import {
  useFinalizeRaffleMutation,
  useStartRaffleMutation,
} from '@/lib/react-query/mutations/raffle'
import {
  useUpdateUserSelectedIndexMutation,
  useUpdateUserShortlistStatusMutation,
} from '@/lib/react-query/mutations/shortlist'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'

export const Route = createFileRoute('/_authenticated/raffle')({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(shortlistQueries.all())
  },
  component: RafflePage,
})

type Phase = 'setup' | 'countdown' | 'spinning' | 'winner'

function RafflePage() {
  return (
    <div className="min-h-full flex flex-col px-2 sm:px-4 py-2 relative container mx-auto pb-44 md:pb-4 md:pl-[72px]">
      <Link
        to="/shortlists"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Shortlists
      </Link>
      <PageTitleBar title="Raffle" description="Draw next time's movie" />
      <Suspense fallback={<ShortlistsSkeleton />}>
        <RaffleSetup />
      </Suspense>
    </div>
  )
}

function RaffleSetup() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [watchDate, setWatchDate] = useState<Date | undefined>(undefined)
  const [dryRun, setDryRun] = useState(false)
  const [winningMovie, setWinningMovie] = useState<Movie | null>(null)
  const [winningUserId, setWinningUserId] = useState<string | null>(null)
  const [winningCredits, setWinningCredits] = useState<{
    cast: Array<any> | null
    crew: Array<any> | null
  } | null>(null)

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

  const { data: shortlists = [] } = useSuspenseQuery(shortlistQueries.all())
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

  const handleSelectMovie = (userId: string, index: number) => {
    updateSelectedIndexMutation.mutate({ userId, selectedIndex: index })
  }

  return (
    <div className="flex-1 py-6 space-y-6">
      {phase === 'setup' && (
        <>
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
                onSelectMovie={(movieIndex: number) =>
                  handleSelectMovie(shortlist.user.id, movieIndex)
                }
                isUpdating={
                  updateStatusMutation.isPending &&
                  updateStatusMutation.variables.userId === shortlist.user.id
                }
                isSelecting={
                  updateSelectedIndexMutation.isPending &&
                  updateSelectedIndexMutation.variables.userId ===
                    shortlist.user.id
                }
                delay={index * 0.06}
              />
            ))}
          </div>
          <RaffleControlBar
            watchDate={watchDate}
            onDateSelect={setWatchDate}
            dryRun={dryRun}
            onDryRunChange={setDryRun}
            onStartRaffle={handleStartRaffle}
            canStart={canStart}
            readyCount={readyCount}
            totalCount={participating.length}
            pendingSelectionsCount={pendingSelections.length}
          />
        </>
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
    </div>
  )
}
