import { useEffect, useState } from 'react'

interface UseDialogAnimationProps {
  open: boolean
  triggerRect: DOMRect | null
  onClose: () => void
}

export function useDialogAnimation({
  open,
  triggerRect,
  onClose,
}: UseDialogAnimationProps) {
  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showImage, setShowImage] = useState(false)

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
      onClose()
    }, 350)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const backdropStyle: React.CSSProperties = {
    opacity: mounted && !isClosing ? 1 : 0,
    transition: isClosing ? 'opacity 0.35s ease-out' : 'opacity 0.4s ease-out',
  }

  return {
    mounted,
    isClosing,
    showImage,
    handleClose,
    handleBackdropClick,
    backdropStyle,
  }
}
