import type { TMDBMovie } from '@/lib/react-query/queries/home'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Film, Star, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface MovieCardDialogProps {
  movie: TMDBMovie | null
  open: boolean
  onOpenChange: (open: boolean) => void
  layoutId: string
}

export function MovieCardDialog({
  movie,
  open,
  onOpenChange,
  layoutId,
}: MovieCardDialogProps) {
  const backdropUrl = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null
  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null
  const year = movie?.release_date
    ? new Date(movie.release_date).getFullYear()
    : null

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onOpenChange])

  if (!movie) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              layoutId={layoutId}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-border/30 bg-card shadow-2xl"
              style={{
                maxHeight: '90vh',
              }}
            >
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.1 }}
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-110"
              >
                <X className="h-5 w-5" />
              </motion.button>

              <div className="relative h-full max-h-[90vh] overflow-y-auto">
                <div className="relative h-[40vh] min-h-[300px] w-full">
                  {backdropUrl ? (
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      src={backdropUrl}
                      alt={movie.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : posterUrl ? (
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      src={posterUrl}
                      alt={movie.title}
                      className="absolute inset-0 h-full w-full object-cover blur-sm scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <Film className="h-20 w-20 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-card/80 via-transparent to-transparent" />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="absolute right-6 top-6 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-base font-semibold text-white backdrop-blur-md"
                  >
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    {movie.vote_average.toFixed(1)}
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="relative -mt-24 px-6 pb-8 md:px-8"
                >
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                      {movie.title}
                    </h2>
                    <div className="mt-3 flex items-center gap-4 text-sm text-foreground/70">
                      {year && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {year}
                        </span>
                      )}
                      {movie.vote_count > 0 && (
                        <span>{movie.vote_count.toLocaleString()} votes</span>
                      )}
                    </div>

                    {movie.overview && (
                      <div className="mt-6">
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/60">
                          Overview
                        </h3>
                        <p className="text-base leading-relaxed text-foreground/80">
                          {movie.overview}
                        </p>
                      </div>
                    )}

                    {movie.genre_ids && movie.genre_ids.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/60">
                          Genres
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {movie.genre_ids.map((genreId) => (
                            <span
                              key={genreId}
                              className="rounded-full border border-border/50 bg-muted px-3 py-1 text-sm text-foreground/70"
                            >
                              ID: {genreId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
