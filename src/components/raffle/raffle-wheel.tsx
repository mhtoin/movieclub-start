import { getImageUrl } from '@/lib/tmdb-api'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface RaffleWheelProps {
  candidates: Array<{
    movieId: string
    movieTitle: string
    userName: string
    posterPath?: string
  }>
  onComplete: (winner: {
    movieId: string
    movieTitle: string
    userName: string
    posterPath?: string
  }) => void
}

export function RaffleWheel({ candidates, onComplete }: RaffleWheelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [speed, setSpeed] = useState(50)
  const [isSlowingDown, setIsSlowingDown] = useState(false)

  useEffect(() => {
    // Start the spinning immediately
    const spinDuration = 4000 // 4 seconds of fast spinning

    // Fast spinning phase
    const fastSpinTimer = setTimeout(() => {
      setIsSlowingDown(true)
    }, spinDuration)

    return () => clearTimeout(fastSpinTimer)
  }, [])

  useEffect(() => {
    if (!isSlowingDown) {
      // Fast spinning
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % candidates.length)
      }, speed)
      return () => clearInterval(interval)
    } else {
      // Slowing down progressively
      let currentSpeed = speed
      const slowDownInterval = setInterval(() => {
        currentSpeed += 50 // Increase delay progressively
        setSpeed(currentSpeed)

        if (currentSpeed > 800) {
          // Stop at final winner
          clearInterval(slowDownInterval)
          setTimeout(() => {
            onComplete(candidates[currentIndex])
          }, 500)
        } else {
          setCurrentIndex((prev) => (prev + 1) % candidates.length)
        }
      }, currentSpeed)

      return () => clearInterval(slowDownInterval)
    }
  }, [isSlowingDown, speed, candidates, currentIndex, onComplete])

  const currentCandidate = candidates[currentIndex]
  const posterUrl = currentCandidate.posterPath
    ? getImageUrl(currentCandidate.posterPath, 'w500')
    : null

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Spotlight effect */}
      <div className="relative">
        <motion.div
          className="absolute inset-0 blur-3xl"
          animate={{
            background: [
              'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Movie card display */}
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="relative w-80 h-[28rem] bg-card border-4 border-primary rounded-3xl shadow-2xl overflow-hidden"
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={currentCandidate.movieTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-9xl opacity-50">🎬</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Movie info */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <motion.h3
              className="text-2xl font-bold text-white mb-2 line-clamp-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {currentCandidate.movieTitle}
            </motion.h3>
            <p className="text-white/80 text-lg">
              by {currentCandidate.userName}
            </p>
          </div>

          {/* Sparkle effects */}
          <motion.div
            className="absolute top-4 right-4 text-yellow-400"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute top-1/4 left-4 text-yellow-400"
            animate={{ rotate: -360, scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            ⭐
          </motion.div>
        </motion.div>
      </div>

      {/* Progress indicator */}
      <motion.div
        className="text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <p className="text-2xl font-bold text-primary">
          {isSlowingDown ? '🎉 Selecting winner...' : '🎲 Spinning...'}
        </p>
        <p className="text-muted-foreground mt-2">
          {candidates.length} candidates in the draw
        </p>
      </motion.div>
    </div>
  )
}
