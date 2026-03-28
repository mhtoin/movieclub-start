import { Clapperboard, Film, Star } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
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
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  isActive: boolean
  isPast: boolean
}) {
  return (
    <motion.div
      initial={false}
      animate={{
        scale: isActive ? 1 : 0.85,
        opacity: isActive ? 1 : isPast ? 0.3 : 0.15,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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
            className={`transition-all duration-300 ${
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
              className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                isActive ? 'bg-background' : 'bg-background/40'
              }`}
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-foreground/80 flex items-center justify-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                isActive ? 'bg-background' : 'bg-background/40'
              }`}
            />
          ))}
        </div>
      </div>
      <motion.span
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0.5,
          y: isActive ? 0 : 4,
        }}
        transition={{ duration: 0.2 }}
        className={`absolute -bottom-8 text-[10px] font-bold tracking-[0.3em] uppercase ${
          isActive ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {label}
      </motion.span>
    </motion.div>
  )
}

function NowShowing() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="flex flex-col items-center"
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="overflow-hidden"
      >
        <span className="text-[2rem] sm:text-[3rem] font-black tracking-wider text-primary whitespace-nowrap">
          NOW SHOWING
        </span>
      </motion.div>
      <div className="flex items-center gap-3 mt-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:0.15s]" />
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:0.3s]" />
      </div>
    </motion.div>
  )
}

export function RaffleCountdown({ onComplete }: Props) {
  const [phase, setPhase] = useState<'countdown' | 'showing'>('countdown')
  const [activeIndex, setActiveIndex] = useState(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = []

    COUNTDOWN_ITEMS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setActiveIndex(i)
        }, i * 800),
      )
    })

    timers.push(
      setTimeout(
        () => {
          setPhase('showing')
        },
        COUNTDOWN_ITEMS.length * 800 + 200,
      ),
    )

    timers.push(
      setTimeout(
        () => {
          onCompleteRef.current()
        },
        COUNTDOWN_ITEMS.length * 800 + 1200,
      ),
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <AnimatePresence mode="wait">
        {phase === 'countdown' ? (
          <motion.div
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
              />
            ))}
          </motion.div>
        ) : (
          <NowShowing key="showing" />
        )}
      </AnimatePresence>

      <p className="absolute bottom-16 text-xs text-muted-foreground tracking-wide">
        Selecting tonight's feature presentation
      </p>
    </motion.div>
  )
}
