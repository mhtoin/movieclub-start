import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { slideVariants } from './animation-variants'

interface Slide {
  id: string
  label: string
  icon: ReactNode
  content: ReactNode
}

interface SlideTabsProps {
  slides: Slide[]
  activeSlide: number
  slideDirection: number
  onSlideChange: (index: number) => void
}

export function SlideTabs({
  slides,
  activeSlide,
  slideDirection,
  onSlideChange,
}: SlideTabsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-full border border-border/40 bg-background/60 p-1 backdrop-blur-sm w-fit">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => onSlideChange(index)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
              index === activeSlide
                ? 'text-primary-foreground'
                : 'text-foreground/60 hover:text-foreground',
            )}
            type="button"
          >
            {index === activeSlide && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {slide.icon}
              <span className="hidden sm:inline">{slide.label}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="relative min-h-[140px] overflow-hidden rounded-2xl border border-border/40 bg-background/70 px-4 py-6 backdrop-blur-md sm:min-h-[130px]">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={activeSlide}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.15 },
            }}
          >
            {slides[activeSlide]?.content}
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSlideChange(index)}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                index === activeSlide
                  ? 'w-5 bg-primary'
                  : 'w-1.5 bg-foreground/20 hover:bg-foreground/40',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
