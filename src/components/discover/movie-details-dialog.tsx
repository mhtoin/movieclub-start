import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatedPoster } from './animated-poster'
import { MovieDetailsView } from './movie-details-view'
import { MovieOverviewView } from './movie-overview-view'
import { useDialogAnimation } from './use-dialog-animation'
import type { Movie } from '@/lib/tmdb-api'
import { getImageUrl } from '@/lib/tmdb-api'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { useAddToShortlistMutation } from '@/lib/react-query/mutations/shortlist'
import { useMediaQuery } from '@/lib/hooks'
import {
  DrawerClose,
  DrawerContent,
  DrawerHandle,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
} from '@/components/ui/drawer'
import { X } from 'lucide-react'

interface MovieDetailsDialogProps {
  movie: Movie | null
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRect: DOMRect | null
  addingMode?: boolean
  onAdded?: () => void
}

export function MovieDetailsDialog({
  movie,
  open,
  onOpenChange,
  triggerRect,
  addingMode = false,
  onAdded,
}: MovieDetailsDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { mutate: addToShortlist, isPending } = useAddToShortlistMutation()
  const [currentView, setCurrentView] = useState<'overview' | 'details'>(
    'overview',
  )
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const posterUrl = movie ? getImageUrl(movie.poster_path, 'w500') : null
  const backdropUrl = movie ? getImageUrl(movie.backdrop_path, 'w1280') : null

  const { data: movieDetails, isLoading } = useQuery({
    ...tmdbQueries.movieDetails(movie?.id ?? 0),
    enabled: open && !!movie,
  })

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
      if (containerRef.current) {
        const scrollContainer =
          containerRef.current.querySelector('.overflow-y-auto')
        if (scrollContainer) {
          scrollContainer.scrollTop = 0
        }
      }
    }, 200)
  }

  const handleDrawerClose = () => {
    onOpenChange(false)
    setCurrentView('overview')
    setIsTransitioning(false)
  }

  const handleAddToShortlist = () => {
    addToShortlist(movie!.id, {
      onSuccess: () => {
        if (addingMode) {
          setTimeout(() => {
            onOpenChange(false)
            onAdded?.()
          }, 400)
        }
      },
    })
  }

  if (!movie) return null

  if (!isDesktop) {
    return (
      <DrawerRoot open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerPortal>
          <DrawerOverlay opacity="heavy" />
          <DrawerContent
            direction="bottom"
            className="max-h-[90vh] flex flex-col"
          >
            <DrawerHandle direction="bottom" />

            <DrawerClose asChild>
              <button
                className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                onClick={handleDrawerClose}
              >
                <X className="h-4 w-4" />
              </button>
            </DrawerClose>
            <div className="flex gap-4 p-4 pb-2">
              {posterUrl && (
                <div className="flex-shrink-0 w-24">
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className="w-full rounded-md shadow-lg aspect-[2/3] object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="text-xl font-bold leading-tight line-clamp-2">
                  {movie.title}
                </h2>
                {movie.original_title !== movie.title && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {movie.original_title}
                  </p>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div
                className="space-y-4"
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
                    onAddToShortlist={handleAddToShortlist}
                    onShowMoreInfo={() => handleViewTransition('details')}
                    isPending={isPending}
                    isLoading={isLoading}
                    compact
                  />
                ) : (
                  <MovieDetailsView
                    title={movie.title}
                    movieDetails={movieDetails}
                    onBack={() => handleViewTransition('overview')}
                    onAddToShortlist={handleAddToShortlist}
                    isPending={isPending}
                    compact
                  />
                )}
              </div>
            </div>
          </DrawerContent>
        </DrawerPortal>
      </DrawerRoot>
    )
  }

  if (!open) return null

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

  const contentPadding = 32
  const dialogWidth = Math.min(window.innerWidth * 0.92, 832)
  const posterWidth = 160
  const contentGap = 28
  const contentWidth =
    dialogWidth - contentPadding * 2 - posterWidth - contentGap

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
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
        {backdropUrl && (
          <div className="relative h-56 w-full overflow-hidden flex-shrink-0">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="h-full w-full object-cover"
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
        )}
        {!backdropUrl && (
          <div className="h-1 w-full shrink-0 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
        )}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex gap-7 p-8">
            <div
              className="flex-shrink-0"
              style={{
                width: posterWidth,
                visibility: mounted && showImage ? 'hidden' : 'hidden',
              }}
            >
              <div className="aspect-[2/3] rounded-lg" />
            </div>
            <div
              className="flex-1 min-w-0 space-y-5"
              style={{ width: contentWidth, maxWidth: 'calc(100% - 188px)' }}
            >
              <div
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning
                    ? 'translateX(12px)'
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
                    onAddToShortlist={handleAddToShortlist}
                    onShowMoreInfo={() => handleViewTransition('details')}
                    isPending={isPending}
                    isLoading={isLoading}
                  />
                ) : (
                  <MovieDetailsView
                    title={movie.title}
                    movieDetails={movieDetails}
                    onBack={() => handleViewTransition('overview')}
                    onAddToShortlist={handleAddToShortlist}
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
