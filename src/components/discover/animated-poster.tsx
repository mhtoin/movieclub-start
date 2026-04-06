interface AnimatedPosterProps {
  posterUrl: string | null
  movieTitle: string
  triggerRect: DOMRect | null
  showImage: boolean
  mounted: boolean
  isClosing: boolean
}

export function AnimatedPoster({
  posterUrl,
  movieTitle,
  triggerRect,
  showImage,
  mounted,
  isClosing,
}: AnimatedPosterProps) {
  if (!posterUrl) return null

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

    const dialogWidth = Math.min(window.innerWidth * 0.92, 832)
    const contentPadding = 32
    const finalImageWidth = 160
    const dialogTop =
      (window.innerHeight - Math.min(window.innerHeight * 0.86, 576)) / 2

    const dialogLeft = (window.innerWidth - dialogWidth) / 2
    const imageLeft = dialogLeft + contentPadding
    const imageTop = dialogTop + 180

    if (!showImage) {
      return {
        position: 'fixed',
        top: `${triggerRect.top}px`,
        left: `${triggerRect.left}px`,
        width: `${triggerRect.width}px`,
        height: `${triggerRect.height}px`,
        zIndex: 200,
        borderRadius: '0.75rem',
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
        borderRadius: '0.75rem',
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
        borderRadius: '0.75rem',
        opacity: 0,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 1, 1)',
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
      borderRadius: '0.75rem',
      opacity: 1,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow:
        '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(255 255 255 / 0.05)',
    }
  }

  return (
    <img
      src={posterUrl}
      alt={movieTitle}
      style={getImageStyle()}
      className="object-cover pointer-events-none"
    />
  )
}
