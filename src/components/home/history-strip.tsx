import type { Movie } from '@/db/schema/movies'
import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Calendar, Ticket } from 'lucide-react'

interface HistoryStripProps {
  movies: Movie[]
}

export function HistoryStrip({ movies }: HistoryStripProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-px w-6 bg-primary/50" />
          <span className="font-cinema-caps text-xs tracking-[0.2em] text-primary uppercase">
            Recently Watched
          </span>
        </div>
        <Link
          to="/watched"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {movies.length === 0 ? (
        <div className="rounded-xl border border-border/20 bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No movies watched yet. Run your first raffle to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie, index) => {
            const posterPath =
              (movie.images as any)?.posters?.[0]?.file_path ?? null
            const posterUrl = posterPath
              ? `https://image.tmdb.org/t/p/w342${posterPath}`
              : null
            const watchDate = movie.watchDate
              ? new Date(movie.watchDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : null

            return (
              <motion.div
                key={movie.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="group relative overflow-hidden rounded-xl bg-muted">
                  <div className="aspect-[2/3]">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={movie.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Ticket className="h-8 w-8 text-muted-foreground/25" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    {watchDate && (
                      <span className="text-[10px] font-medium text-white/80 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {watchDate}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs font-medium text-foreground line-clamp-1">
                  {movie.title}
                </p>
                {movie.releaseDate && (
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(movie.releaseDate).getFullYear()}
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
