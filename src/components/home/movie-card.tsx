import { motion, useReducedMotion } from 'framer-motion'
import { Calendar, Film, Star } from 'lucide-react'
import { useState } from 'react'

import { useIsLowEndDevice } from '@/lib/hooks/use-device-capability'
import type { TMDBMovie } from '@/lib/react-query/queries/home'

import { MovieCardDialog } from './movie-card-dialog'

interface MovieCardProps {
  movie: TMDBMovie
  index: number
  isLowEnd?: boolean
}

export function MovieCard({
  movie,
  index,
  isLowEnd: isLowEndProp,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const isLowEndDevice = useIsLowEndDevice()
  const prefersSimpleAnimations =
    (shouldReduceMotion || isLowEndProp) ?? isLowEndDevice
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

  // Optimized transition for layout animations
  const layoutTransition = prefersSimpleAnimations
    ? { duration: 0 }
    : {
        type: 'tween' as const,
        duration: 0.25,
        ease: 'easeOut' as const,
      }

  return (
    <>
      <motion.div
        initial={prefersSimpleAnimations ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: prefersSimpleAnimations ? 0 : index * 0.05,
          duration: prefersSimpleAnimations ? 0.15 : 0.3,
        }}
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
            layoutId={prefersSimpleAnimations ? undefined : layoutId}
            layoutDependency={isOpen}
            transition={layoutTransition}
            className="relative h-[200px] w-[320px] overflow-hidden rounded-2xl border border-border/30 bg-card shadow-xl sm:h-[240px] sm:w-[400px]"
          >
            {backdropUrl ? (
              <img
                src={backdropUrl}
                srcSet={`${backdropUrl.replace('/w780', '/w342')} 342w, ${backdropUrl.replace('/w780', '/w500')} 500w, ${backdropUrl} 780w`}
                sizes="(max-width: 640px) 320px, 400px"
                alt={movie.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                width={780}
                height={439}
              />
            ) : posterUrl ? (
              <img
                src={posterUrl}
                srcSet={`${posterUrl.replace('/w342', '/w185')} 185w, ${posterUrl} 342w`}
                sizes="(max-width: 640px) 320px, 400px"
                alt={movie.title}
                className="absolute inset-0 h-full w-full object-cover blur-sm scale-110"
                loading="lazy"
                width={342}
                height={513}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Film className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            {movie.becauseYouLiked && (
              <div className="absolute left-3 top-3 z-[1] flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-md">
                {movie.becauseYouLiked.posterPath && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.becauseYouLiked.posterPath}`}
                    alt={movie.becauseYouLiked.title}
                    className="h-5 w-4 rounded-[2px] object-cover"
                  />
                )}
                <span className="max-w-[180px] truncate text-[10px] font-medium text-white/90 sm:max-w-[240px] sm:text-xs">
                  Because you liked{' '}
                  <span className="font-semibold">
                    {movie.becauseYouLiked.title}
                  </span>
                </span>
              </div>
            )}
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-sm font-semibold text-white backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {movie.vote_average.toFixed(1)}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <h3 className="line-clamp-1 text-lg font-bold text-white drop-shadow-lg sm:text-xl text-left">
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
                initial={
                  prefersSimpleAnimations ? false : { opacity: 0, height: 0 }
                }
                animate={{
                  opacity: isHovered ? 1 : 0,
                  height: isHovered ? 'auto' : 0,
                }}
                transition={{ duration: prefersSimpleAnimations ? 0.1 : 0.2 }}
                className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/70 sm:text-sm text-left"
              >
                {movie.overview}
              </motion.p>
            </div>
          </motion.div>
        </button>
      </motion.div>

      <MovieCardDialog
        movie={movie}
        open={isOpen}
        onOpenChange={setIsOpen}
        layoutId={layoutId}
        prefersSimpleAnimations={prefersSimpleAnimations}
      />
    </>
  )
}
