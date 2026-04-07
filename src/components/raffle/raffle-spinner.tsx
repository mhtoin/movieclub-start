import { motion, useAnimate, useMotionValue, useTransform } from 'framer-motion'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { Movie } from '@/db/schema/movies'
import { getMovieBackdropUrl } from '@/lib/utils'

interface Props {
  movies: Array<Movie>
  winningMovie: Movie
  onSpinComplete: () => void
  arrowColor?: string
}

const ITEM_HEIGHT = 200
const VISIBLE_COUNT = 5
const WINDOW_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT
const REEL_WIDTH = 400
const SPROCKET_WIDTH = 36
const IMAGE_H = ITEM_HEIGHT - 20
const IMAGE_W = REEL_WIDTH - SPROCKET_WIDTH * 2 - 8
const FRAME_COUNT = 8

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

const FilmPerforations = memo(function FilmPerforations() {
  return (
    <div
      className="flex-shrink-0 flex flex-col justify-evenly py-3"
      style={{
        width: SPROCKET_WIDTH,
        background: 'var(--muted)',
      }}
    >
      {Array.from({ length: FRAME_COUNT }).map((_, i) => (
        <div
          key={i}
          className="mx-auto"
          style={{
            width: 10,
            height: 16,
            borderRadius: 2,
            background: 'var(--border)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)',
          }}
        />
      ))}
    </div>
  )
})

const ReelFrame = memo(function ReelFrame({
  movie,
  isWinner,
  frameNumber,
}: {
  movie: Movie
  isWinner: boolean
  frameNumber: number
}) {
  const imgUrl = getMovieBackdropUrl(movie, 'w500')
  return (
    <div className="flex items-stretch" style={{ height: ITEM_HEIGHT }}>
      <FilmPerforations />

      <div
        className="relative flex-1 flex items-center justify-center"
        style={{ padding: '10px 4px' }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={movie.title}
            className="rounded-sm object-cover"
            style={{
              height: IMAGE_H,
              width: IMAGE_W,
            }}
            loading={isWinner ? 'eager' : 'lazy'}
            draggable={false}
          />
        ) : (
          <div
            className="rounded-sm flex items-center justify-center text-xs font-medium text-center px-2"
            style={{
              height: IMAGE_H,
              width: IMAGE_W,
              background: 'var(--accent)',
              color: 'var(--muted-foreground)',
            }}
          >
            {movie.title}
          </div>
        )}
        <div
          className="absolute bottom-[10px] left-[4px] right-[4px] rounded-b flex items-end justify-center overflow-hidden"
          style={{ height: IMAGE_H / 2 }}
        >
          <div
            className="w-full px-3 pb-2 pt-6"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
            }}
          >
            <p className="text-[10px] font-bold text-white/95 truncate text-center leading-tight tracking-wide">
              {movie.title}
            </p>
            {movie.releaseDate && (
              <p className="text-[9px] text-white/50 text-center mt-0.5">
                {movie.releaseDate.slice(0, 4)}
              </p>
            )}
          </div>
        </div>
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/30 tracking-widest">
          {String(frameNumber).padStart(4, '0')}
        </div>
      </div>

      <FilmPerforations />
    </div>
  )
})

const ReelStrip = memo(function ReelStrip({
  movies,
  winningMovieId,
  stripRef,
}: {
  movies: Array<Movie>
  winningMovieId: string
  stripRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div ref={stripRef} className="will-change-transform">
      {movies.map((movie, i) => (
        <ReelFrame
          key={`${movie.id}-${i}`}
          movie={movie}
          isWinner={movie.id === winningMovieId}
          frameNumber={i + 1}
        />
      ))}
    </div>
  )
})

export function RaffleSpinner({
  movies,
  winningMovie,
  onSpinComplete,
  arrowColor = 'var(--primary)',
}: Props) {
  const spinParams = useMemo(
    () => ({
      laps: Math.floor(Math.random() * 3) + 6,
      duration: 6000 + Math.random() * 3000,
      landingJitter: (Math.random() - 0.5) * ITEM_HEIGHT * 0.6,
    }),
    [],
  )

  const animFrameRef = useRef<number>(0)
  const stripRef = useRef<HTMLDivElement | null>(null)
  const completedRef = useRef(false)
  const [locked, setLocked] = useState(false)
  const [settling, setSettling] = useState(false)
  const [drumRef, animateDrum] = useAnimate()

  const onSpinCompleteRef = useRef(onSpinComplete)
  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete
  })

  const speedProgress = useMotionValue(0)
  const barWidth = useTransform(speedProgress, [0, 1], ['100%', '0%'])

  const repeated = useMemo(
    () => Array.from({ length: spinParams.laps + 2 }, () => movies).flat(),
    [movies, spinParams.laps],
  )

  const winningIndex = movies.findIndex((m) => m.id === winningMovie.id)
  const targetOffset =
    (spinParams.laps * movies.length + winningIndex) * ITEM_HEIGHT -
    WINDOW_HEIGHT / 2 +
    ITEM_HEIGHT / 2 +
    spinParams.landingJitter

  useEffect(() => {
    const { duration } = spinParams
    const start = performance.now()
    const startOffset = Math.random() * movies.length * ITEM_HEIGHT

    if (stripRef.current) {
      stripRef.current.style.transform = `translateY(-${startOffset}px)`
    }

    const totalDistance = targetOffset - startOffset

    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)

      const eased = easeOutCubic(t)

      speedProgress.set(eased)
      const offset = startOffset + totalDistance * eased

      if (stripRef.current) {
        stripRef.current.style.transform = `translateY(-${offset}px)`
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick)
      } else {
        if (stripRef.current) {
          stripRef.current.style.transform = `translateY(-${targetOffset}px)`
        }
        setSettling(true)
        setLocked(true)

        animateDrum(
          drumRef.current,
          {
            rotate: [0, -1.5, 1.5, -1, 0.8, -0.5, 0],
          },
          {
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          },
        )

        setTimeout(() => {
          if (!completedRef.current) {
            completedRef.current = true
            onSpinCompleteRef.current()
          }
        }, 800)
      }
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative z-20 text-center mb-8 px-4"
      >
        <p
          className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2"
          style={{ color: 'var(--primary)' }}
        >
          {locked
            ? settling
              ? '★ Winner Selected ★'
              : '◆ Drawing'
            : '◆ Drawing'}
        </p>
        <h2
          className="text-3xl sm:text-4xl font-black tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          {locked ? (settling ? 'And the pick is…' : 'Spinning…') : 'Spinning…'}
        </h2>
      </motion.div>

      <motion.div
        ref={drumRef}
        className="relative z-20"
        animate={settling ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="pointer-events-none flex-shrink-0"
            animate={{
              x: locked ? [0, 8, -8, 6, -4, 2, 0] : [0, 4, -4, 3, -2, 0],
              opacity: locked ? [1, 0.7, 1] : 1,
            }}
            transition={{
              duration: locked ? 0.8 : 1.2,
              repeat: locked ? 0 : Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg width="16" height="28" viewBox="0 0 16 28" fill="none">
              <path d="M0 0 L16 14 L0 28 Z" style={{ fill: arrowColor }} />
            </svg>
          </motion.div>

          <div className="relative">
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                width: REEL_WIDTH,
                height: WINDOW_HEIGHT,
                background: 'var(--card)',
                boxShadow: `
                  inset 0 0 0 2px var(--border),
                  inset 0 0 30px rgba(0,0,0,0.3),
                  0 0 0 1px rgba(0,0,0,0.5),
                  0 20px 60px rgba(0,0,0,0.4)
                `,
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.15) 100%)',
                }}
              />
              <ReelStrip
                movies={repeated}
                winningMovieId={winningMovie.id}
                stripRef={stripRef}
              />
            </div>

            <div
              className="absolute left-0 top-0 bottom-0 w-3 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to right, var(--background) 0%, transparent 100%)',
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-3 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to left, var(--background) 0%, transparent 100%)',
              }}
            />

            <div
              className="absolute top-1/2 left-0 right-0 h-0.5 pointer-events-none -translate-y-1/2 z-20"
              style={{
                background:
                  'linear-gradient(to right, transparent, var(--primary) 20%, var(--primary) 80%, transparent)',
                boxShadow: '0 0 8px var(--primary)',
              }}
            />
          </div>

          <motion.div
            className="pointer-events-none flex-shrink-0"
            animate={{
              x: locked ? [0, -8, 8, -6, 4, -2, 0] : [0, -4, 4, -3, 2, 0],
              opacity: locked ? [1, 0.7, 1] : 1,
            }}
            transition={{
              duration: locked ? 0.8 : 1.2,
              repeat: locked ? 0 : Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg width="16" height="28" viewBox="0 0 16 28" fill="none">
              <path d="M16 0 L0 14 L16 28 Z" style={{ fill: arrowColor }} />
            </svg>
          </motion.div>
        </div>

        <div
          className="mt-5 mx-2 h-1.5 rounded-full overflow-hidden"
          style={{
            background: 'var(--border)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, color-mix(in oklch, var(--primary) 60%, transparent), var(--primary))`,
              width: locked ? undefined : barWidth,
            }}
            animate={locked ? { opacity: [1, 0.6, 1] } : {}}
            transition={{ duration: 0.4 }}
          />
        </div>

        <p
          className="text-center text-[10px] uppercase tracking-[0.2em] mt-2 font-medium"
          style={{
            color: 'var(--muted-foreground)',
            letterSpacing: '0.15em',
          }}
        >
          {locked ? (settling ? 'locked in' : 'settling…') : 'spinning'}
        </p>
      </motion.div>

      {locked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-16 text-center"
        >
          <div
            className="px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            Watch the screen!
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
