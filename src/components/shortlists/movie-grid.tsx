import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MovieGridProps {
  children: ReactNode
  columns?: 2 | 3 | 6
}

export function MovieGrid({ children, columns = 6 }: MovieGridProps) {
  const gridClass =
    columns === 6
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
      : columns === 3
        ? 'grid-cols-2 sm:grid-cols-3'
        : 'grid-cols-2'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`grid ${gridClass} gap-3 sm:gap-4 auto-rows-max`}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedMovieWrapperProps {
  children: ReactNode
  delay?: number
}

export function AnimatedMovieWrapper({
  children,
  delay = 0,
}: AnimatedMovieWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay,
      }}
      className="relative"
    >
      {children}
    </motion.div>
  )
}
