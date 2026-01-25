import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink, Film, Play } from 'lucide-react'
import { fadeInUp } from './animation-variants'

interface HeroActionsProps {
  trailerLink: string | null
  providerLink: string | null
  formattedWatchDate: string | null
  tmdbLink: string | null
  imdbLink: string | null
}

export function HeroActions({
  trailerLink,
  providerLink,
  formattedWatchDate,
  tmdbLink,
  imdbLink,
}: HeroActionsProps) {
  return (
    <>
      <motion.div
        variants={fadeInUp}
        className="flex flex-wrap items-center gap-2"
      >
        {trailerLink && (
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              buttonVariants({
                variant: 'primary',
                size: 'default',
              }),
              'gap-2 shadow-lg shadow-primary/25',
            )}
            href={trailerLink}
            target="_blank"
            rel="noreferrer"
          >
            <Play className="h-4 w-4 fill-current" />
            Trailer
          </motion.a>
        )}
        {providerLink && (
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={buttonVariants({
              variant: 'secondary',
              size: 'default',
            })}
            href={providerLink}
            target="_blank"
            rel="noreferrer"
          >
            Watch Now
          </motion.a>
        )}
        <Link
          to="/discover"
          className={buttonVariants({
            variant: 'outline',
            size: 'default',
          })}
        >
          Discover
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="flex items-center gap-4 text-xs"
      >
        {formattedWatchDate && (
          <span className="flex items-center gap-1.5 text-foreground/60">
            <Film className="h-3.5 w-3.5" />
            Watched {formattedWatchDate}
          </span>
        )}
        <div className="flex items-center gap-3 text-foreground/50">
          {tmdbLink && (
            <a
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              href={tmdbLink}
              target="_blank"
              rel="noreferrer"
            >
              TMDB
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {imdbLink && (
            <a
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              href={imdbLink}
              target="_blank"
              rel="noreferrer"
            >
              IMDb
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </motion.div>
    </>
  )
}
