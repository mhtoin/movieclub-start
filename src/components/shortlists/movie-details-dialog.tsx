import { getImageUrl } from '@/lib/tmdb-api'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatedPoster } from '../discover/animated-poster'
import { useDialogAnimation } from '../discover/use-dialog-animation'

interface MovieDetailsDialogProps {
  movie: any
  open: boolean
  triggerRect: DOMRect | null
  onClose: () => void
}

export function MovieDetailsDialog({
  movie,
  open,
  triggerRect,
  onClose,
}: MovieDetailsDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const posterPath = movie?.images?.posters?.[0]?.file_path
  const posterUrl = posterPath ? getImageUrl(posterPath, 'w500') : null
  const backdropPath = movie?.images?.backdrops?.[0]?.file_path
  const backdropUrl = backdropPath ? getImageUrl(backdropPath, 'w1280') : null

  const {
    mounted,
    isClosing,
    showImage,
    handleClose,
    handleBackdropClick,
    backdropStyle,
  } = useDialogAnimation({
    open,
    triggerRect,
    onClose,
  })

  if (!movie || !open) return null

  const getContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90vw',
      maxWidth: '48rem',
      maxHeight: '90vh',
      zIndex: 110,
      borderRadius: '0.5rem',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }

    if (isClosing || !mounted) {
      return {
        ...baseStyle,
        opacity: 0,
        transition: 'opacity 0.35s ease-out',
      }
    }

    return {
      ...baseStyle,
      opacity: 1,
      transition: 'opacity 0.5s ease-out 0.2s',
    }
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/80 z-[100]"
        style={backdropStyle}
        onClick={handleBackdropClick}
      />
      <AnimatedPoster
        posterUrl={posterUrl}
        movieTitle={movie.title}
        triggerRect={triggerRect}
        showImage={showImage}
        mounted={mounted}
        isClosing={isClosing}
      />
      <div
        ref={containerRef}
        className="bg-dialog-background text-foreground border border-dialog-border shadow-2xl"
        style={getContainerStyle()}
      >
        <div className="relative h-64 flex-shrink-0">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dialog-background via-dialog-background/60 to-transparent" />
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6">
            <div className="flex gap-6">
              {posterUrl && (
                <div className="flex-shrink-0 w-48 invisible">
                  <div className="aspect-[2/3]" />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{movie.title}</h2>
                  {movie.originalTitle !== movie.title && (
                    <p className="text-muted-foreground italic mb-2">
                      {movie.originalTitle}
                    </p>
                  )}
                  {movie.tagline && (
                    <p className="text-lg text-muted-foreground italic">
                      "{movie.tagline}"
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {movie.releaseDate && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📅</span>
                      <span>
                        {new Date(movie.releaseDate).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </span>
                    </div>
                  )}
                  {movie.runtime && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">⏱️</span>
                      <span>{movie.runtime} min</span>
                    </div>
                  )}
                  {movie.voteAverage > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">⭐</span>
                      <span>
                        {movie.voteAverage.toFixed(1)} / 10
                        {movie.voteCount > 0 && (
                          <span className="text-muted-foreground ml-1">
                            ({movie.voteCount.toLocaleString()} votes)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre: string) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                {movie.overview && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Overview</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {movie.overview}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
