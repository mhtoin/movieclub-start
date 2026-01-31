import type { TMDBMovie } from '@/lib/react-query/queries/home'
import { cn } from '@/lib/utils'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { MovieCard } from './movie-card'

interface MovieReelProps {
  title: string
  subtitle: string
  icon: ReactNode
  movies: TMDBMovie[]
  accentColor?: 'orange' | 'blue' | 'green' | 'purple'
}

const accentStyles = {
  orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  green: 'text-green-500 bg-green-500/10 border-green-500/20',
  purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
}

export function MovieReel({
  title,
  subtitle,
  icon,
  movies,
  accentColor = 'orange',
}: MovieReelProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: true,
      skipSnaps: false,
    },
    [WheelGesturesPlugin()],
  )

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="relative py-10 md:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="mb-6 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div
              className={cn(
                'rounded-xl border p-2.5',
                accentStyles[accentColor],
              )}
            >
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                {title}
              </h2>
              <p className="text-xs text-foreground/60 sm:text-sm">
                {subtitle}
              </p>
            </div>
          </motion.div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background/80 backdrop-blur-sm transition-all hover:bg-accent',
                !canScrollPrev && 'cursor-not-allowed opacity-30',
              )}
              type="button"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background/80 backdrop-blur-sm transition-all hover:bg-accent',
                !canScrollNext && 'cursor-not-allowed opacity-30',
              )}
              type="button"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
        <div className="overflow-hidden " ref={emblaRef}>
          <div className="flex touch-pan-y gap-3 sm:gap-4 ">
            {movies.map((movie, index) => (
              <div className="min-w-0 flex-shrink-0" key={movie.id}>
                <MovieCard movie={movie} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
