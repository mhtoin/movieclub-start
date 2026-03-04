import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface Props {
  onComplete: () => void
}

export function RaffleCountdown({ onComplete }: Props) {
  const [count, setCount] = useState<number | 'GO'>(3)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    ;[3, 2, 1].forEach((n, i) => {
      timers.push(
        setTimeout(() => {
          setCount(n)
        }, i * 1000),
      )
    })

    timers.push(
      setTimeout(() => {
        setCount('GO')
      }, 3000),
    )

    timers.push(
      setTimeout(() => {
        onCompleteRef.current()
      }, 3800),
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={String(count)}
          initial={{ scale: 0.2, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 1.8, opacity: 0, y: -30 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          className="select-none"
        >
          {count === 'GO' ? (
            <span className="text-[9rem] sm:text-[12rem] font-black tracking-tight text-primary drop-shadow-2xl">
              GO!
            </span>
          ) : (
            <span className="text-[12rem] sm:text-[16rem] font-black tracking-tight text-foreground drop-shadow-2xl">
              {count}
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="absolute bottom-12 text-sm text-muted-foreground animate-pulse">
        Preparing the draw…
      </p>
    </motion.div>
  )
}
