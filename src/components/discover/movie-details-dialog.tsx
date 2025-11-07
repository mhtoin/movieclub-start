import { useAddToShortlistMutation } from '@/lib/react-query/mutations/shortlist'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { getImageUrl, Movie } from '@/lib/tmdb-api'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatedPoster } from './animated-poster'
import { DialogHeader } from './dialog-header'
import { MovieDetailsView } from './movie-details-view'
import { MovieOverviewView } from './movie-overview-view'
import { useDialogAnimation } from './use-dialog-animation'

interface MovieDetailsDialogProps {
  movie: Movie | null
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRect: DOMRect | null
}

export function MovieDetailsDialog({
  movie,
  open,
  onOpenChange,
  triggerRect,
}: MovieDetailsDialogProps) {
  const { mutate: addToShortlist, isPending } = useAddToShortlistMutation()
  const [currentView, setCurrentView] = useState<'overview' | 'details'>(
    'overview',
  )
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const posterUrl = movie ? getImageUrl(movie.poster_path, 'w500') : null
  const backdropUrl = movie ? getImageUrl(movie.backdrop_path, 'w1280') : null

  // Fetch detailed movie information including watch providers and external IDs
  const { data: movieDetails } = useQuery({
    ...tmdbQueries.movieDetails(movie?.id ?? 0),
    enabled: open && !!movie,
  })

  // Handle dialog animations and state
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
    onClose: () => {
      onOpenChange(false)
      setCurrentView('overview')
      setIsTransitioning(false)
    },
  })

  const handleViewTransition = (view: 'overview' | 'details') => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentView(view)
      setIsTransitioning(false)
      // Scroll to top when changing views
      if (containerRef.current) {
        const scrollContainer =
          containerRef.current.querySelector('.overflow-y-auto')
        if (scrollContainer) {
          scrollContainer.scrollTop = 0
        }
      }
    }, 200)
  }

  if (!movie || !open) return null

  const getContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90vw',
      maxWidth: '48rem',
      height: '90vh',
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
        className="bg-dialog-background text-foreground border border-dialog-border shadow-2xl max-h-[90vh] 2xl:max-h-[55vh]"
        style={getContainerStyle()}
      >
        <DialogHeader
          backdropUrl={backdropUrl}
          movieTitle={movie.title}
          onClose={handleClose}
        />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6">
            <div className="flex gap-6">
              {posterUrl && (
                <div className="flex-shrink-0 w-48 invisible">
                  <div className="aspect-[2/3]" />
                </div>
              )}
              <div
                className="flex-1 space-y-4"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning
                    ? 'translateX(20px)'
                    : 'translateX(0)',
                  transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
                }}
              >
                {currentView === 'overview' ? (
                  <MovieOverviewView
                    title={movie.title}
                    originalTitle={movie.original_title}
                    releaseDate={movie.release_date}
                    voteAverage={movie.vote_average}
                    voteCount={movie.vote_count}
                    overview={movie.overview}
                    movieDetails={movieDetails}
                    onAddToShortlist={() => addToShortlist(movie.id)}
                    onShowMoreInfo={() => handleViewTransition('details')}
                    isPending={isPending}
                  />
                ) : (
                  <MovieDetailsView
                    title={movie.title}
                    movieDetails={movieDetails}
                    onBack={() => handleViewTransition('overview')}
                    onAddToShortlist={() => addToShortlist(movie.id)}
                    isPending={isPending}
                  />
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
