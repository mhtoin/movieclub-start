import { Clapperboard, Film, Star } from 'lucide-react'
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface Props {
  onComplete: () => void
}

const COUNTDOWN_ITEMS = [
  { value: 3, icon: Clapperboard, label: 'READY' },
  { value: 2, icon: Film, label: 'ACTION' },
  { value: 1, icon: Star, label: 'ROLL' },
] as const

function FilmFrame({
  icon: Icon,
  label,
  isActive,
  isPast,
  prefersReducedMotion,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  isActive: boolean
  isPast: boolean
  prefersReducedMotion: boolean
}) {
  return (
    <m.div
      initial={false}
      animate={{
        scale: prefersReducedMotion ? 1 : isActive ? 1 : 0.85,
        opacity: isActive ? 1 : isPast ? 0.3 : 0.15,
      }}
      transition={
        prefersReducedMotion
          ? { duration: 0.12, ease: 'easeOut' }
          : { type: 'spring', stiffness: 300, damping: 25 }
      }
      className="relative flex flex-col items-center justify-center"
    >
      <div
        className={`
          relative w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden
          border-4 transition-colors duration-300
          ${
            isActive
              ? 'border-primary bg-primary/10'
              : isPast
                ? 'border-primary/40 bg-primary/5'
                : 'border-border bg-muted/20'
          }
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon
            className={`transition-colors duration-200 ${
              isActive
                ? 'w-14 h-14 sm:w-18 sm:h-18 text-primary'
                : isPast
                  ? 'w-12 h-12 sm:w-14 sm:h-14 text-primary/60'
                  : 'w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30'
            }`}
            strokeWidth={1.5}
          />
        </div>
        <div className="absolute top-0 left-0 right-0 h-6 bg-foreground/80 flex items-center justify-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors duration-200 ${
                isActive ? 'bg-background' : 'bg-background/40'
              }`}
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-foreground/80 flex items-center justify-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors duration-200 ${
                isActive ? 'bg-background' : 'bg-background/40'
              }`}
            />
          ))}
        </div>
      </div>
      <m.span
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0.5,
          y: prefersReducedMotion ? 0 : isActive ? 0 : 4,
        }}
        transition={{ duration: 0.2 }}
        className={`absolute -bottom-8 text-[10px] font-bold tracking-[0.3em] uppercase ${
          isActive ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {label}
      </m.span>
    </m.div>
  )
}

function NowShowing({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean
}) {
  return (
    <m.div
      initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.12, ease: 'easeOut' }
          : { type: 'spring', stiffness: 200, damping: 20 }
      }
      className="flex flex-col items-center"
    >
      <m.div
        initial={{
          opacity: 0,
          transform: prefersReducedMotion ? 'scaleX(1)' : 'scaleX(0.96)',
        }}
        animate={{ opacity: 1, transform: 'scaleX(1)' }}
        transition={{
          delay: prefersReducedMotion ? 0 : 0.1,
          duration: prefersReducedMotion ? 0.12 : 0.2,
          ease: 'easeOut',
        }}
        style={{ transformOrigin: 'center' }}
        className="overflow-hidden"
      >
        <span className="text-[2rem] sm:text-[3rem] font-black tracking-wider text-primary whitespace-nowrap">
          NOW SHOWING
        </span>
      </m.div>
      <div className="flex items-center gap-3 mt-3">
        <div className="size-2 rounded-full bg-primary animate-pulse" />
        <div className="size-2 rounded-full bg-primary animate-pulse [animation-delay:0.15s]" />
        <div className="size-2 rounded-full bg-primary animate-pulse [animation-delay:0.3s]" />
      </div>
    </m.div>
  )
}

export function RaffleCountdown({ onComplete }: Props) {
  const [phase, setPhase] = useState<'countdown' | 'showing'>('countdown')
  const [activeIndex, setActiveIndex] = useState(0)
  const onCompleteRef = useRef(onComplete)
  const prefersReducedMotion = useReducedMotion() ?? false

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = []
    const stepDuration = prefersReducedMotion ? 120 : 800
    const showingDelay = prefersReducedMotion ? 120 : 200
    const completionDelay = prefersReducedMotion ? 240 : 1200

    COUNTDOWN_ITEMS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setActiveIndex(i)
        }, i * stepDuration),
      )
    })

    timers.push(
      setTimeout(
        () => {
          setPhase('showing')
        },
        COUNTDOWN_ITEMS.length * stepDuration + showingDelay,
      ),
    )

    timers.push(
      setTimeout(
        () => {
          onCompleteRef.current()
        },
        COUNTDOWN_ITEMS.length * stepDuration + completionDelay,
      ),
    )

    return () => timers.forEach(clearTimeout)
  }, [prefersReducedMotion])

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      >
        <AnimatePresence mode="wait">
          {phase === 'countdown' ? (
            <m.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-8 sm:gap-12"
            >
              {COUNTDOWN_ITEMS.map((item, i) => (
                <FilmFrame
                  key={item.value}
                  icon={item.icon}
                  label={item.label}
                  isActive={i === activeIndex}
                  isPast={i < activeIndex}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </m.div>
          ) : (
            <NowShowing
              key="showing"
              prefersReducedMotion={prefersReducedMotion}
            />
          )}
        </AnimatePresence>

        <p className="absolute bottom-16 text-xs text-muted-foreground tracking-wide">
          Selecting tonight's feature presentation
        </p>
      </m.div>
    </LazyMotion>
  )
}
