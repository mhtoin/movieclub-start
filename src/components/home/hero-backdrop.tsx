import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface HeroBackdropProps {
  backdropUrl: string
  title: string
}

export function HeroBackdrop({ backdropUrl, title }: HeroBackdropProps) {
  return (
    <>
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 via-background to-background" />
        )}
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_0%,var(--background)_70%)]" />
    </>
  )
}

export function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-2 text-foreground/40"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <ChevronRight className="h-4 w-4 rotate-90" />
      </motion.div>
    </motion.div>
  )
}
