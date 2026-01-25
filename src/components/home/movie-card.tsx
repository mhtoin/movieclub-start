import type { TMDBMovie } from '@/lib/react-query/queries/home'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Film, Star } from 'lucide-react'
import { useState } from 'react'

interface MovieCardProps {
  movie: TMDBMovie
  index: number
}

export function MovieCard({ movie, index }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex-shrink-0"
    >
      <Link
        to="/discover"
        className="group relative block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          animate={{
            scale: isHovered ? 1.05 : 1,
            y: isHovered ? -8 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative h-[240px] w-[160px] overflow-hidden rounded-xl border border-border/40 bg-muted shadow-lg sm:h-[280px] sm:w-[185px]"
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
              <Film className="h-8 w-8 opacity-50" />
            </div>
          )}
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {movie.vote_average.toFixed(1)}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 20,
            }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-3"
          >
            <h3 className="line-clamp-2 text-sm font-semibold text-white">
              {movie.title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
              {year && <span>{year}</span>}
            </div>
            {movie.overview && (
              <p className="mt-2 line-clamp-2 text-[11px] text-white/60">
                {movie.overview}
              </p>
            )}
          </motion.div>
        </motion.div>
        <motion.div
          animate={{
            opacity: isHovered ? 0.3 : 0,
            scale: isHovered ? 1 : 0.8,
          }}
          className="absolute inset-0 -z-10 rounded-xl bg-primary blur-xl"
        />
      </Link>
    </motion.div>
  )
}
