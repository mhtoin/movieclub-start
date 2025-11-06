import { Movie, getImageUrl } from '@/lib/tmdb-api'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface MoviePosterDialogProps {
  movie: Movie | null
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRect: DOMRect | null
}

export default function MoviePosterDialog({
  movie,
  open,
  onOpenChange,
  triggerRect,
}: MoviePosterDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const posterUrl = movie ? getImageUrl(movie.poster_path, 'w500') : null

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
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    setMounted(false)
    setTimeout(() => {
      setShowImage(false)
      onOpenChange(false)
    }, 350)
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

    const dialogWidth = window.innerWidth / 2
    const contentPadding = 24
    const finalImageWidth = 480

    const dialogLeft = window.innerWidth - dialogWidth
    const imageLeft = dialogLeft + contentPadding
    const imageTop = 0 + contentPadding

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
          alt={movie?.title}
          style={getImageStyle()}
          className="object-cover pointer-events-none"
        />
      )}
    </>,
    document.body,
  )
}
