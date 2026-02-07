import { Button } from '@/components/ui/button'
import { useAddToShortlistMutation } from '@/lib/react-query/mutations/shortlist'
import type { TMDBMovie } from '@/lib/react-query/queries/home'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  ExternalLink,
  Film,
  Play,
  Plus,
  Star,
  Tv,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface MovieCardDialogProps {
  movie: TMDBMovie | null
  open: boolean
  onOpenChange: (open: boolean) => void
  layoutId: string
  prefersSimpleAnimations?: boolean
}

export function MovieCardDialog({
  movie,
  open,
  onOpenChange,
  layoutId,
  prefersSimpleAnimations = false,
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

  const { data: genresData = [] } = useQuery(tmdbQueries.genres())
  const { data: movieDetails } = useQuery({
    ...tmdbQueries.movieDetails(movie?.id ?? 0),
    enabled: open && !!movie,
  })
  const { mutate: addToShortlist, isPending } = useAddToShortlistMutation()

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

  // Only render portal on client-side
  if (typeof document === 'undefined') return null

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

          <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={() => onOpenChange(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              layoutId={prefersSimpleAnimations ? undefined : layoutId}
              layoutDependency={open}
              transition={{
                layout: prefersSimpleAnimations
                  ? { duration: 0 }
                  : {
                      type: 'tween',
                      duration: 0.25,
                      ease: 'easeOut',
                    },
              }}
              initial={
                prefersSimpleAnimations
                  ? { opacity: 0, scale: 0.95 }
                  : undefined
              }
              animate={
                prefersSimpleAnimations ? { opacity: 1, scale: 1 } : undefined
              }
              exit={
                prefersSimpleAnimations
                  ? { opacity: 0, scale: 0.95 }
                  : undefined
              }
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-border/30 bg-card shadow-2xl"
              style={{
                maxHeight: '90vh',
                willChange: 'transform',
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

              <div className="relative h-full max-h-[90vh] overflow-auto no-scrollbar">
                <div className="relative h-[40vh] min-h-[300px] w-full">
                  {backdropUrl ? (
                    <Image
                      src={backdropUrl}
                      alt={movie.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="eager"
                      layout="fullWidth"
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
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="relative -mt-24 px-6 pb-8 md:px-8"
                >
                  <div className="relative z-10">
                    <div>
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

                    {movie.becauseYouLiked && (
                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                        {movie.becauseYouLiked.posterPath && (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.becauseYouLiked.posterPath}`}
                            alt={movie.becauseYouLiked.title}
                            className="h-12 w-8 rounded-md object-cover shadow-md"
                          />
                        )}
                        <div>
                          <p className="text-xs font-medium text-blue-400">
                            Recommended because you liked
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {movie.becauseYouLiked.title}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a
                        href={`https://www.themoviedb.org/movie/${movie.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md bg-[#01b4e4] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#01b4e4]/90"
                        title="View on TMDb"
                      >
                        <span>TMDb</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {movieDetails?.imdb_id && (
                        <a
                          href={`https://www.imdb.com/title/${movieDetails.imdb_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-md bg-[#F5C518] px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#F5C518]/90"
                          title="View on IMDb"
                        >
                          <span>IMDb</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {movieDetails?.['watch/providers']?.results?.FI?.link && (
                        <a
                          href={movieDetails['watch/providers'].results.FI.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                          title="Where to Watch"
                        >
                          <Tv className="h-3 w-3" />
                          <span>Where to Watch</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
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

                    {movieDetails?.videos?.results &&
                      movieDetails.videos.results.length > 0 && (
                        <div className="mt-6">
                          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/60">
                            Trailers
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {movieDetails.videos.results
                              .filter(
                                (video) =>
                                  video.site === 'YouTube' &&
                                  video.type === 'Trailer',
                              )
                              .slice(0, 3)
                              .map((video) => (
                                <a
                                  key={video.id}
                                  href={`https://www.youtube.com/watch?v=${video.key}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted/80 hover:text-foreground"
                                >
                                  <Play className="h-4 w-4" />
                                  <span className="line-clamp-1">
                                    {video.name}
                                  </span>
                                </a>
                              ))}
                          </div>
                        </div>
                      )}

                    {movie.genre_ids && movie.genre_ids.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/60">
                          Genres
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {movie.genre_ids.map((genreId) => {
                            const genre = genresData.find(
                              (g) => g.value === genreId.toString(),
                            )
                            return (
                              <Link
                                key={genreId}
                                to="/discover"
                                search={{
                                  genres: genreId.toString(),
                                  providers: '8|323|463|496',
                                  minRating: 0,
                                  maxRating: 10,
                                  sortBy: 'popularity.desc',
                                }}
                                className="rounded-full border border-border/50 bg-muted px-3 py-1 text-sm text-foreground/70 transition-colors hover:bg-muted/80 hover:text-foreground"
                              >
                                {genre?.label || 'Unknown'}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex gap-3">
                      <Button
                        className="flex-1 gap-2"
                        variant="primary"
                        loading={isPending}
                        onClick={() => addToShortlist(movie.id)}
                      >
                        <Plus className="h-4 w-4" />
                        Add to Shortlist
                      </Button>
                    </div>
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
