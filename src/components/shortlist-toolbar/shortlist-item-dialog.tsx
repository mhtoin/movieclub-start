import { Movie } from '@/db/schema/movies'
import {
  useRemoveFromShortlistMutation,
  useUpdateSelectedIndexMutation,
} from '@/lib/react-query/mutations/shortlist'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  Check,
  Clock,
  ExternalLink,
  Film,
  Play,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ShortlistItemDialogProps {
  movie: Movie | null
  open: boolean
  onOpenChange: (open: boolean) => void
  layoutId: string
  requiresSelection?: boolean
  selectedIndex?: number | null
  index: number
}

export function ShortlistItemDialog({
  movie,
  open,
  onOpenChange,
  layoutId,
  requiresSelection,
  selectedIndex,
  index,
}: ShortlistItemDialogProps) {
  const { mutate: removeFromShortlist, isPending: isRemoving } =
    useRemoveFromShortlistMutation()
  const { mutate: updateSelectedIndex, isPending: isUpdatingSelection } =
    useUpdateSelectedIndexMutation()

  const isSelected = requiresSelection && selectedIndex === index

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
  if (typeof document === 'undefined') return null

  const backdropPath = movie.images?.backdrops?.[0]?.file_path
  const posterPath = movie.images?.posters?.[0]?.file_path
  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null
  const genres = movie.genres ?? []
  const cast =
    (
      movie.cast as Array<{
        id: number
        name: string
        character: string
        profile_path: string | null
      }> | null
    )?.slice(0, 6) ?? []

  const trailers = (
    (
      movie.videos as {
        results?: Array<{
          key: string
          site: string
          type: string
          name: string
          official: boolean
        }>
      } | null
    )?.results ?? []
  )
    .filter(
      (video) =>
        video.site === 'YouTube' &&
        (video.type === 'Trailer' || video.type === 'Teaser'),
    )
    .slice(0, 2)

  const handleToggleSelection = () => {
    if (!requiresSelection) return
    updateSelectedIndex(isSelected ? null : index)
  }

  const handleRemove = () => {
    removeFromShortlist(movie.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

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
              layoutId={layoutId}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 350,
              }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/30 bg-card shadow-2xl"
              style={{
                maxHeight: '85vh',
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

              <div className="relative h-full max-h-[85vh] overflow-auto no-scrollbar">
                <div className="relative h-[35vh] min-h-[280px] w-full">
                  {backdropPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/original${backdropPath}`}
                      alt={movie.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${posterPath}`}
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
                  className="relative -mt-20 px-6 pb-6"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="absolute right-6 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md"
                  >
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {movie.voteAverage.toFixed(1)}
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                    {movie.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                    {year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {year}
                      </span>
                    )}
                    {movie.runtime && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {movie.runtime} min
                        </span>
                      </>
                    )}
                  </div>
                  {genres.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                  {movie.tagline && (
                    <p className="mt-4 text-sm italic text-muted-foreground/80">
                      &ldquo;{movie.tagline}&rdquo;
                    </p>
                  )}
                  {movie.overview && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-2">
                        Overview
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {movie.overview}
                      </p>
                    </div>
                  )}
                  {(movie.imdbId || movie.tmdbId || trailers.length > 0) && (
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-3">
                        Links
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {movie.imdbId && (
                          <a
                            href={`https://www.imdb.com/title/${movie.imdbId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5C518]/10 hover:bg-[#F5C518]/20 border border-[#F5C518]/30 text-foreground text-sm font-medium transition-colors group"
                          >
                            <ExternalLink className="w-4 h-4 text-[#F5C518]" />
                            <span>IMDb</span>
                          </a>
                        )}
                        {movie.tmdbId && (
                          <a
                            href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#01D277]/10 hover:bg-[#01D277]/20 border border-[#01D277]/30 text-foreground text-sm font-medium transition-colors group"
                          >
                            <ExternalLink className="w-4 h-4 text-[#01D277]" />
                            <span>TMDb</span>
                          </a>
                        )}
                        {trailers.map((trailer) => (
                          <a
                            key={trailer.key}
                            href={`https://www.youtube.com/watch?v=${trailer.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/30 text-foreground text-sm font-medium transition-colors group"
                          >
                            <Play className="w-4 h-4 text-[#FF0000]" />
                            <span>{trailer.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {cast.length > 0 && (
                    <div className="mt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-muted-foreground/60" />
                        <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                          Cast
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {cast.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            {member.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${member.profile_path}`}
                                alt={member.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-border/30"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center ring-2 ring-border/30">
                                <span className="text-xs text-muted-foreground font-medium">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-foreground truncate">
                                {member.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {member.character}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-6 flex items-center gap-3">
                    {requiresSelection && (
                      <button
                        onClick={handleToggleSelection}
                        disabled={isUpdatingSelection}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                            : 'bg-accent text-foreground hover:bg-accent/80 border border-border'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {isSelected
                          ? 'Selected for Raffle'
                          : 'Select for Raffle'}
                      </button>
                    )}
                    <button
                      onClick={handleRemove}
                      disabled={isRemoving}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 border border-destructive/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
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
