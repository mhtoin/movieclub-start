import type { Movie } from '@/db/schema/movies'
import { getMovieBackdropUrl } from '@/lib/utils'
import { motion, useAnimate, useMotionValue, useTransform } from 'framer-motion'
import { memo, useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  movies: Movie[]
  winningMovie: Movie
  onSpinComplete: () => void
  /** When true, the reel spins indefinitely at a constant speed (never locks). */
  debug?: boolean
  /** CSS color for the side arrows. Defaults to the primary theme color. */
  arrowColor?: string
}

const ITEM_HEIGHT = 200
const VISIBLE_COUNT = 5
const WINDOW_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT
const SPIN_DURATION = 8000 // ms
const LAPS = 6
const REEL_WIDTH = 400
const SPROCKET_WIDTH = 36
const CENTER_ITEM = Math.floor(VISIBLE_COUNT / 2) // index 2
const IMAGE_H = ITEM_HEIGHT - 20
const IMAGE_W = REEL_WIDTH - SPROCKET_WIDTH * 2 - 8

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5)
}

const SprocketStrip = memo(function SprocketStrip() {
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center justify-evenly"
      style={{ width: SPROCKET_WIDTH, background: 'var(--muted)' }}
    >
      {[0, 1].map((h) => (
        <div
          key={h}
          className="rounded-sm"
          style={{
            width: 14,
            height: 22,
            background: 'var(--border)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
          }}
        />
      ))}
    </div>
  )
})

const ReelFrame = memo(function ReelFrame({
  movie,
  isWinner,
}: {
  movie: Movie
  isWinner: boolean
}) {
  const imgUrl = getMovieBackdropUrl(movie, 'w500')
  return (
    <div
      className="flex items-stretch"
      style={{ height: ITEM_HEIGHT, borderBottom: '2px solid var(--border)' }}
    >
      <SprocketStrip />

      <div
        className="relative flex-1 flex items-center justify-center"
        style={{ padding: '10px 4px' }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={movie.title}
            className="rounded object-cover"
            style={{ height: IMAGE_H, width: IMAGE_W }}
            loading={isWinner ? 'eager' : 'lazy'}
            draggable={false}
          />
        ) : (
          <div
            className="rounded flex items-center justify-center text-xs font-medium text-center px-2"
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
                'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
            }}
          >
            <p className="text-[11px] font-semibold text-white/90 truncate text-center leading-tight">
              {movie.title}
            </p>
            {movie.releaseDate && (
              <p className="text-[9px] text-white/50 text-center mt-0.5">
                {movie.releaseDate.slice(0, 4)}
              </p>
            )}
          </div>
        </div>
      </div>

      <SprocketStrip />
    </div>
  )
})

const ReelStrip = memo(function ReelStrip({
  movies,
  winningMovieId,
  stripRef,
}: {
  movies: Movie[]
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
        />
      ))}
    </div>
  )
})

export function RaffleSpinner({
  movies,
  winningMovie,
  onSpinComplete,
  debug = false,
  arrowColor = 'var(--primary)',
}: Props) {
  const animFrameRef = useRef<number>(0)
  const stripRef = useRef<HTMLDivElement | null>(null)
  const completedRef = useRef(false)
  const [locked, setLocked] = useState(false)
  const [drumRef, animateDrum] = useAnimate()

  const onSpinCompleteRef = useRef(onSpinComplete)
  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete
  })

  const speedProgress = useMotionValue(0)

  const barWidth = useTransform(speedProgress, [0, 1], ['100%', '0%'])

  // Extend strip to (LAPS + 2) copies so the animation can travel in one
  // continuous direction without ever wrapping — the wrap-around jump was
  // the source of the odd flashing during spinning.
  const repeated = useMemo(
    () => Array.from({ length: LAPS + 2 }, () => movies).flat(),
    [movies],
  )
  const winningIndex = movies.findIndex((m) => m.id === winningMovie.id)
  // Place the winning frame in copy `LAPS` (0-indexed) so there are always
  // exactly LAPS full revolutions between any random start in copy 0 and
  // the target.
  const targetOffset =
    (LAPS * movies.length + winningIndex) * ITEM_HEIGHT -
    WINDOW_HEIGHT / 2 +
    ITEM_HEIGHT / 2

  useEffect(() => {
    const start = performance.now()
    const startOffset = Math.floor(Math.random() * movies.length) * ITEM_HEIGHT

    if (debug) {
      const SPEED = 600 // px/s
      // In debug mode wrap within the whole strip so we don't fly off the end
      const singleCopyHeight = movies.length * ITEM_HEIGHT
      const tick = (now: number) => {
        const elapsed = now - start
        const offset =
          (startOffset + (elapsed / 1000) * SPEED) % singleCopyHeight
        speedProgress.set(0.3)
        if (stripRef.current) {
          stripRef.current.style.transform = `translateY(-${offset}px)`
        }
        animFrameRef.current = requestAnimationFrame(tick)
      }
      animFrameRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(animFrameRef.current)
    }

    // totalDistance is always positive: target is LAPS copies ahead of start.
    // No modulo wrapping — the strip is long enough to cover the full distance.
    const totalDistance = targetOffset - startOffset

    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / SPIN_DURATION, 1)
      const eased = easeOutQuint(t)
      const offset = startOffset + totalDistance * eased

      speedProgress.set(eased)
      if (stripRef.current) {
        stripRef.current.style.transform = `translateY(-${offset}px)`
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick)
      } else {
        if (stripRef.current) {
          stripRef.current.style.transform = `translateY(-${targetOffset}px)`
        }
        setLocked(true)
        animateDrum(
          drumRef.current,
          { x: [0, -8, 8, -6, 6, -3, 3, 0] },
          { duration: 0.5, ease: 'easeOut' },
        )
        setTimeout(() => {
          if (!completedRef.current) {
            completedRef.current = true
            onSpinCompleteRef.current()
          }
        }, 700)
      }
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="relative z-20 text-center mb-10 px-4"
      >
        <p
          className="text-[11px] font-bold uppercase tracking-[0.25em] mb-3"
          style={{ color: 'hsl(var(--primary))' }}
        >
          {locked ? '✦ Winner Selected ✦' : '✦ Drawing'}
        </p>
        <h2
          className="text-3xl sm:text-4xl font-black tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          {locked ? 'And the pick is…' : 'Spinning…'}
        </h2>
      </motion.div>
      <motion.div ref={drumRef} className="relative z-20">
        <div className="flex items-center gap-3">
          <motion.div
            className="pointer-events-none flex-shrink-0"
            animate={{ x: locked ? [0, 6, 0] : [0, 3, 0] }}
            transition={{
              duration: locked ? 0.9 : 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg
              width="20"
              height="32"
              viewBox="0 0 20 32"
              style={{
                filter: `drop-shadow(0 0 6px color-mix(in oklch, ${arrowColor} 90%, transparent))`,
              }}
            >
              <path d="M0 0 L20 16 L0 32 Z" style={{ fill: arrowColor }} />
            </svg>
          </motion.div>
          <div className="relative rounded-2xl p-[2px]">
            <div className="rounded-2xl">
              <div
                className="relative overflow-hidden rounded-xl fade-mask fade-y-40"
                style={{
                  width: REEL_WIDTH,
                  height: WINDOW_HEIGHT,
                  background: 'var(--card)',
                }}
              >
                <ReelStrip
                  movies={repeated}
                  winningMovieId={winningMovie.id}
                  stripRef={stripRef}
                />
              </div>
            </div>
          </div>
          <motion.div
            className="pointer-events-none flex-shrink-0"
            animate={{ x: locked ? [0, -6, 0] : [0, -3, 0] }}
            transition={{
              duration: locked ? 0.9 : 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg
              width="20"
              height="32"
              viewBox="0 0 20 32"
              style={{
                filter: `drop-shadow(0 0 6px color-mix(in oklch, ${arrowColor} 90%, transparent))`,
              }}
            >
              <path d="M20 0 L0 16 L20 32 Z" style={{ fill: arrowColor }} />
            </svg>
          </motion.div>
        </div>
        <div
          className="mt-4 mx-2 h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--border)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                'linear-gradient(90deg, hsl(var(--primary) / 0.7), hsl(var(--primary)))',
              width: locked ? undefined : barWidth,
            }}
            animate={locked ? { width: '100%' } : undefined}
            transition={
              locked ? { duration: 0.25, ease: 'easeOut' } : undefined
            }
          />
        </div>
        <p
          className="text-center text-[10px] uppercase tracking-widest mt-1.5"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {locked ? 'locked in' : 'spinning'}
        </p>
      </motion.div>
    </motion.div>
  )
}
