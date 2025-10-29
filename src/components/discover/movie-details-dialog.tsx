import { Button } from '@/components/ui/button'
import { getImageUrl, Movie } from '@/lib/tmdb-api'
import { Calendar, Plus, Star, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

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
  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const posterUrl = movie ? getImageUrl(movie.poster_path, 'w500') : null
  const backdropUrl = movie ? getImageUrl(movie.backdrop_path, 'w1280') : null

  useEffect(() => {
    if (open && triggerRect) {
      setIsClosing(false)
      setMounted(false)
      setShowImage(false)

      requestAnimationFrame(() => {
        setShowImage(true)
        requestAnimationFrame(() => {
          setMounted(true)
        })
      })
    } else if (!open) {
      setMounted(false)
      setShowImage(false)
    }
  }, [open, triggerRect])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open])

  const handleClose = () => {
    setIsClosing(true)
    setMounted(false)
    setTimeout(() => {
      setShowImage(false)
      onOpenChange(false)
    }, 350)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!movie || !open) return null

  const getImageStyle = (): React.CSSProperties => {
    if (!triggerRect) {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '12rem',
        height: 'auto',
      }
    }

    const dialogWidth = Math.min(window.innerWidth * 0.9, 768)
    const contentPadding = 24
    const finalImageWidth = 192

    const dialogLeft = (window.innerWidth - dialogWidth) / 2
    const imageLeft = dialogLeft + contentPadding
    const imageTop = (window.innerHeight - 600) / 2 + 264 + contentPadding

    if (!showImage) {
      return {
        position: 'fixed',
        top: `${triggerRect.top}px`,
        left: `${triggerRect.left}px`,
        width: `${triggerRect.width}px`,
        height: `${triggerRect.height}px`,
        zIndex: 200,
        borderRadius: '0.5rem',
        opacity: 0,
        transition: 'none',
      }
    }

    if (!mounted && !isClosing) {
      return {
        position: 'fixed',
        top: `${triggerRect.top}px`,
        left: `${triggerRect.left}px`,
        width: `${triggerRect.width}px`,
        height: `${triggerRect.height}px`,
        zIndex: 200,
        borderRadius: '0.5rem',
        opacity: 1,
        transition: 'opacity 0.15s ease-in',
      }
    }

    if (!mounted && isClosing) {
      return {
        position: 'fixed',
        top: `${triggerRect.top}px`,
        left: `${triggerRect.left}px`,
        width: `${triggerRect.width}px`,
        height: `${triggerRect.height}px`,
        zIndex: 200,
        borderRadius: '0.5rem',
        opacity: 0,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.6, 1)',
        boxShadow: 'none',
      }
    }

    return {
      position: 'fixed',
      top: `${imageTop}px`,
      left: `${imageLeft}px`,
      width: `${finalImageWidth}px`,
      height: 'auto',
      zIndex: 200,
      borderRadius: '0.5rem',
      opacity: 1,
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      boxShadow:
        '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    }
  }

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

  const backdropStyle: React.CSSProperties = {
    opacity: mounted && !isClosing ? 1 : 0,
    transition: isClosing ? 'opacity 0.35s ease-out' : 'opacity 0.4s ease-out',
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/80 z-[100]"
        style={backdropStyle}
        onClick={handleBackdropClick}
      />
      {posterUrl && (
        <img
          src={posterUrl}
          alt={movie.title}
          style={getImageStyle()}
          className="object-cover pointer-events-none"
        />
      )}
      <div
        ref={containerRef}
        className="bg-dialog-background text-foreground border border-dialog-border shadow-2xl"
        style={getContainerStyle()}
      >
        <div className="relative h-full overflow-y-auto">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
          {backdropUrl && (
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src={backdropUrl}
                alt={movie.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dialog-background to-transparent" />
            </div>
          )}
          <div className="p-6">
            <div className="flex gap-6">
              {posterUrl && (
                <div className="flex-shrink-0 w-48 invisible">
                  <div className="aspect-[2/3]" />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold">{movie.title}</h2>
                  {movie.original_title !== movie.title && (
                    <p className="text-sm text-muted-foreground">
                      {movie.original_title}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {movie.release_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({movie.vote_count.toLocaleString()} votes)
                    </span>
                  </div>
                </div>
                {movie.overview && (
                  <div>
                    <h3 className="mb-2 font-semibold">Overview</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {movie.overview}
                    </p>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <Button className="gap-2" variant={'primary'}>
                    <Plus className="h-4 w-4" />
                    Add to Shortlist
                  </Button>
                  <Button variant="outline">More Info</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
