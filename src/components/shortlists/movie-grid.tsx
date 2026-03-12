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
    <div
      className={`grid ${gridClass} gap-3 sm:gap-4 auto-rows-max animate-fade-in`}
    >
      {children}
    </div>
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
    <div
      className="relative animate-scale-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}
