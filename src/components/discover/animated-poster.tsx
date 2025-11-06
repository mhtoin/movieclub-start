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

  return (
    <img
      src={posterUrl}
      alt={movieTitle}
      style={getImageStyle()}
      className="object-cover pointer-events-none"
    />
  )
}
