import { getImageUrl } from '@/lib/tmdb-api'
import { motion } from 'framer-motion'
import { Sparkles, Trophy } from 'lucide-react'

interface WinnerDisplayProps {
  winner: {
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
  onNewRaffle: () => void
}

export function WinnerDisplay({ winner, onNewRaffle }: WinnerDisplayProps) {
  const posterUrl = winner.posterPath
    ? getImageUrl(winner.posterPath, 'w780')
    : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center space-y-8 max-w-5xl mx-auto"
    >
      {/* Confetti effect simulation with emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: 0,
            }}
            animate={{
              y: window.innerHeight + 50,
              rotate: 360,
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 0.5,
              ease: 'linear',
            }}
          >
            {
              ['🎉', '🎊', '✨', '⭐', '🎬', '🏆'][
                Math.floor(Math.random() * 6)
              ]
            }
          </motion.div>
        ))}
      </div>

      {/* Winner announcement */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Trophy
            size={80}
            className="text-yellow-500 mx-auto drop-shadow-2xl"
          />
        </motion.div>
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600">
          WINNER!
        </h1>
        <p className="text-2xl text-muted-foreground">
          Movie of the Week has been selected
        </p>
      </motion.div>

      {/* Winner card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 opacity-30 animate-pulse" />

        <div className="relative bg-card border-4 border-primary rounded-3xl shadow-2xl overflow-hidden max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Poster */}
            <div className="relative aspect-[2/3] md:aspect-auto">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={winner.movieTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-9xl opacity-50">🎬</span>
                </div>
              )}
              <div className="absolute top-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                <Trophy size={16} />
                WINNER
              </div>
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col justify-center space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-3 line-clamp-3">
                  {winner.movieTitle}
                </h2>
                <div className="flex items-center gap-2 text-lg text-primary">
                  <Sparkles size={20} />
                  <span className="font-semibold">
                    Suggested by {winner.userName}
                  </span>
                </div>
              </div>

              {winner.movieData && (
                <div className="space-y-3 text-muted-foreground">
                  {winner.movieData.releaseDate && (
                    <p className="text-sm">
                      <span className="font-semibold text-foreground">
                        Release:{' '}
                      </span>
                      {new Date(winner.movieData.releaseDate).getFullYear()}
                    </p>
                  )}
                  {winner.movieData.runtime && (
                    <p className="text-sm">
                      <span className="font-semibold text-foreground">
                        Runtime:{' '}
                      </span>
                      {winner.movieData.runtime} minutes
                    </p>
                  )}
                  {winner.movieData.voteAverage && (
                    <p className="text-sm">
                      <span className="font-semibold text-foreground">
                        Rating:{' '}
                      </span>
                      ⭐ {winner.movieData.voteAverage.toFixed(1)}/10
                    </p>
                  )}
                  {winner.movieData.genres &&
                    winner.movieData.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {winner.movieData.genres.map((genre) => (
                          <span
                            key={genre}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  {winner.movieData.overview && (
                    <p className="text-sm leading-relaxed line-clamp-4">
                      {winner.movieData.overview}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNewRaffle}
        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-full shadow-lg transition-all duration-300"
      >
        🎲 Run Another Raffle
      </motion.button>
    </motion.div>
  )
}
