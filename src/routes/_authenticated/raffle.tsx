import { ParticipantCard } from '@/components/raffle/participant-card'
import { RaffleWheel } from '@/components/raffle/raffle-wheel'
import { WinnerDisplay } from '@/components/raffle/winner-display'
import { Button } from '@/components/ui/button'
import { raffleQueries } from '@/lib/react-query/queries/raffle'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Dices, Users } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/raffle')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(raffleQueries.participating())
  },
  component: RafflePage,
})

type RaffleState = 'preview' | 'spinning' | 'winner'

type Candidate = {
  movieId: string
  movieTitle: string
  userName: string
  posterPath?: string
  movieData?: {
    overview?: string
    releaseDate?: string
    voteAverage?: number
    runtime?: number
    genres?: string[]
  }
}

function RafflePage() {
  const { data: shortlists } = useSuspenseQuery(raffleQueries.participating())
  const [raffleState, setRaffleState] = useState<RaffleState>('preview')
  const [winner, setWinner] = useState<Candidate | null>(null)

  // Flatten all movies from all participating shortlists into candidates
  const candidates: Candidate[] = shortlists.flatMap((shortlist) =>
    shortlist.movies.map((movie: any) => ({
      movieId: movie.id,
      movieTitle: movie.title,
      userName: shortlist.user.name,
      posterPath: movie.images?.posters?.[0]?.file_path,
      movieData: {
        overview: movie.overview,
        releaseDate: movie.releaseDate,
        voteAverage: movie.voteAverage,
        runtime: movie.runtime || undefined,
        genres: movie.genres || undefined,
      },
    })),
  )

  const handleStartRaffle = () => {
    setRaffleState('spinning')
  }

  const handleRaffleComplete = (selectedWinner: Candidate) => {
    setWinner(selectedWinner)
    setRaffleState('winner')
  }

  const handleNewRaffle = () => {
    setWinner(null)
    setRaffleState('preview')
  }

  if (shortlists.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Dices size={80} className="text-muted-foreground mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground">
            No Active Participants
          </h1>
          <p className="text-xl text-muted-foreground">
            There are currently no shortlists ready for the raffle. Make sure
            users have marked their shortlists as "Ready" and "Participating".
          </p>
        </div>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Dices size={80} className="text-muted-foreground mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground">
            No Movies Available
          </h1>
          <p className="text-xl text-muted-foreground">
            Participating users don't have any movies in their shortlists yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {raffleState === 'preview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.h1
              className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              🎬 Movie of the Week Raffle
            </motion.h1>
            <p className="text-xl text-muted-foreground">
              Time to pick our next movie adventure!
            </p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto grid grid-cols-2 gap-4"
          >
            <div className="bg-card border-2 border-border rounded-2xl p-6 text-center shadow-lg">
              <Users size={32} className="text-primary mx-auto mb-2" />
              <p className="text-4xl font-bold text-foreground">
                {shortlists.length}
              </p>
              <p className="text-muted-foreground">
                {shortlists.length === 1 ? 'Participant' : 'Participants'}
              </p>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-6 text-center shadow-lg">
              <Dices size={32} className="text-primary mx-auto mb-2" />
              <p className="text-4xl font-bold text-foreground">
                {candidates.length}
              </p>
              <p className="text-muted-foreground">
                {candidates.length === 1 ? 'Movie' : 'Movies'}
              </p>
            </div>
          </motion.div>

          {/* Participants */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
              Participants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shortlists.map((shortlist, index) => (
                <ParticipantCard
                  key={shortlist.id}
                  shortlist={shortlist}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Start Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center pt-8"
          >
            <Button
              onClick={handleStartRaffle}
              className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Dices size={32} className="mr-3" />
              Start the Raffle!
            </Button>
          </motion.div>
        </motion.div>
      )}

      {raffleState === 'spinning' && (
        <div className="flex items-center justify-center min-h-[80vh]">
          <RaffleWheel
            candidates={candidates}
            onComplete={handleRaffleComplete}
          />
        </div>
      )}

      {raffleState === 'winner' && winner && (
        <div className="flex items-center justify-center min-h-[80vh]">
          <WinnerDisplay winner={winner} onNewRaffle={handleNewRaffle} />
        </div>
      )}
    </div>
  )
}
