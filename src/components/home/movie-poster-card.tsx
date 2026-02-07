import { motion } from 'framer-motion'
import { Film, User } from 'lucide-react'

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
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="hidden lg:block"
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-background/80 shadow-2xl backdrop-blur-sm">
          <div className="relative aspect-[2/3] overflow-hidden">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={`${title} poster`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Film className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Added by
                </div>
                <div className="text-sm font-medium text-foreground">
                  {movieUser.name || movieUser.email?.split('@')[0]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
