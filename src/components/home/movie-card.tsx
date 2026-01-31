import type { TMDBMovie } from '@/lib/react-query/queries/home'
import { motion } from 'framer-motion'
import { Calendar, Film, Star } from 'lucide-react'
import { useState } from 'react'
import { MovieCardDialog } from './movie-card-dialog'

interface MovieCardProps {
  movie: TMDBMovie
  index: number
}

export function MovieCard({ movie, index }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : null
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null

  const layoutId = `movie-card-${movie.id}`

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="flex-shrink-0"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            layoutId={layoutId}
            animate={{
              scale: isHovered ? 1.02 : 1,
              y: isHovered ? -4 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative h-[200px] w-[320px] overflow-hidden rounded-2xl border border-border/30 bg-card shadow-xl sm:h-[240px] sm:w-[400px]"
          >
            {backdropUrl ? (
              <img
                src={backdropUrl}
                alt={movie.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            ) : posterUrl ? (
              <img
                src={posterUrl}
                alt={movie.title}
                className="absolute inset-0 h-full w-full object-cover blur-sm scale-110"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Film className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-sm font-semibold text-white backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {movie.vote_average.toFixed(1)}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <h3 className="line-clamp-1 text-lg font-bold text-white drop-shadow-lg sm:text-xl">
                {movie.title}
              </h3>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-white/80 sm:text-sm">
                {year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {year}
                  </span>
                )}
                {movie.vote_count > 0 && (
                  <span className="text-white/60">
                    {movie.vote_count.toLocaleString()} votes
                  </span>
                )}
              </div>
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  height: isHovered ? 'auto' : 0,
                }}
                transition={{ duration: 0.2 }}
                className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/70 sm:text-sm"
              >
                {movie.overview}
              </motion.p>
            </div>
          </motion.div>
          <motion.div
            animate={{
              opacity: isHovered ? 0.2 : 0,
              scale: isHovered ? 1 : 0.9,
            }}
            className="absolute inset-0 -z-10 rounded-2xl bg-primary blur-2xl"
          />
        </button>
      </motion.div>

      <MovieCardDialog
        movie={movie}
        open={isOpen}
        onOpenChange={setIsOpen}
        layoutId={layoutId}
      />
    </>
  )
}
