import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Film, User } from 'lucide-react'
import { useState } from 'react'

interface MovieUser {
  name: string | null
  email: string | null
}

interface MoviePosterCardProps {
  title: string
  posterUrl: string
  movieUser: MovieUser
}

export function MoviePosterCard({
  title,
  posterUrl,
  movieUser,
}: MoviePosterCardProps) {
  const [isPosterHovered, setIsPosterHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="hidden lg:block"
    >
      <motion.div
        className="relative"
        onHoverStart={() => setIsPosterHovered(true)}
        onHoverEnd={() => setIsPosterHovered(false)}
        animate={{
          scale: isPosterHovered ? 1.02 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-background/80 shadow-2xl backdrop-blur-sm">
          <div className="relative aspect-[2/3] overflow-hidden">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={`${title} poster`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Film className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPosterHovered ? 1 : 0 }}
            >
              <Link
                to="/watched"
                className={cn(
                  buttonVariants({
                    variant: 'primary',
                    size: 'sm',
                  }),
                  'gap-2',
                )}
              >
                <Film className="h-4 w-4" />
                View Details
              </Link>
            </motion.div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-foreground/50">
                  Added by
                </div>
                <div className="text-sm font-medium">
                  {movieUser.name || movieUser.email?.split('@')[0]}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                to="/watched"
                className={cn(
                  buttonVariants({
                    variant: 'default',
                    size: 'xs',
                  }),
                  'flex-1 justify-center text-xs',
                )}
              >
                Watched
              </Link>
              <Link
                to="/shortlists"
                search={{ dryRun: false }}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'xs' }),
                  'flex-1 justify-center text-xs',
                )}
              >
                Shortlist
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-2xl opacity-60" />
      </motion.div>
    </motion.div>
  )
}
