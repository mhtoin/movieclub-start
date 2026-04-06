import { getResponsiveImageProps } from '@/lib/tmdb-api'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatedPoster } from '../discover/animated-poster'
import { useDialogAnimation } from '../discover/use-dialog-animation'
import { X } from 'lucide-react'

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
  const posterImage = getResponsiveImageProps(posterPath, 'poster', 'w500')
  const backdropPath = movie?.images?.backdrops?.[0]?.file_path
  const backdropImage = getResponsiveImageProps(
    backdropPath,
    'backdrop',
    'w1280',
  )

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
      width: '92vw',
      maxWidth: '52rem',
      maxHeight: '86vh',
      zIndex: 110,
      borderRadius: '0.75rem',
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
      transition: 'opacity 0.5s ease-out 0.15s',
    }
  }

  const posterWidth = 160
  const contentGap = 28

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
        style={backdropStyle}
        onClick={handleBackdropClick}
      />
      <AnimatedPoster
        posterUrl={posterImage?.src ?? null}
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
        {backdropImage ? (
          <div className="relative h-56 w-full overflow-hidden flex-shrink-0">
            <img
              src={backdropImage.src}
              srcSet={backdropImage.srcSet}
              sizes="(min-width: 1024px) 52rem, 92vw"
              alt={movie.title}
              className="w-full h-full object-cover"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dialog-background via-dialog-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-dialog-background/50 via-transparent to-dialog-background/30" />
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white/90 hover:bg-black/60 hover:text-white transition-all border border-white/10 flex items-center justify-center z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="h-1 w-full shrink-0 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
        )}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex gap-7 p-8">
            <div
              className="flex-shrink-0"
              style={{ width: posterWidth, visibility: 'hidden' }}
            >
              <div className="aspect-[2/3] rounded-lg" />
            </div>
            <div
              className="flex-1 min-w-0 space-y-5"
              style={{ maxWidth: `calc(100% - ${posterWidth + contentGap}px)` }}
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight leading-tight">
                  {movie.title}
                </h2>
                {movie.originalTitle !== movie.title && (
                  <p className="text-sm text-muted-foreground mt-0.5 italic">
                    {movie.originalTitle}
                  </p>
                )}
                {movie.tagline && (
                  <p className="text-base text-muted-foreground/70 italic mt-1.5">
                    "{movie.tagline}"
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {movie.releaseDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Released</span>
                    <span className="font-medium">
                      {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {movie.runtime && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Runtime</span>
                    <span className="font-medium">{movie.runtime} min</span>
                  </div>
                )}
                {movie.voteAverage > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-500/90">★</span>
                    <span className="font-semibold">
                      {movie.voteAverage.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground/60 text-xs">
                      ({movie.voteCount.toLocaleString()})
                    </span>
                  </div>
                )}
              </div>
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres.slice(0, 4).map((genre: string) => (
                    <span
                      key={genre}
                      className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-secondary/40 text-secondary-foreground"
                    >
                      {genre}
                    </span>
                  ))}
                  {movie.genres.length > 4 && (
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-secondary/40 text-secondary-foreground">
                      +{movie.genres.length - 4}
                    </span>
                  )}
                </div>
              )}
              {movie.overview && (
                <div>
                  <h3 className="text-sm font-semibold mb-1.5">Overview</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {movie.overview}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
