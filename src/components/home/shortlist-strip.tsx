import type { MovieWithCredits } from '@/db/schema/movies'
import type { Shortlist } from '@/db/schema/shortlists'
import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { Clapperboard, Plus, Ticket } from 'lucide-react'

/* eslint-disable react-refresh/only-export-components */

type ShortlistWithMovies = Shortlist & {
  movies: MovieWithCredits[]
}

interface ShortlistStripProps {
  shortlist: ShortlistWithMovies | null
}

const ROTATIONS = [-2.5, 1.8, -1.2, 3.0, -0.8, 2.2, -3.0, 1.5, -1.8, 2.8]

function Clothespin() {
  return (
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-[2px] z-20 pointer-events-none">
      <div
        className="w-[5px] h-4 rounded-sm shadow-sm -rotate-6 origin-bottom"
        style={{
          background:
            'color-mix(in oklch, var(--muted-foreground) 70%, var(--primary) 30%)',
        }}
      />
      <div
        className="w-[5px] h-4 rounded-sm shadow-sm rotate-6 origin-bottom"
        style={{
          background:
            'color-mix(in oklch, var(--muted-foreground) 70%, var(--primary) 30%)',
        }}
      />
    </div>
  )
}

export function ShortlistStrip({ shortlist }: ShortlistStripProps) {
  const shouldReduceMotion = useReducedMotion()
  const movies = shortlist?.movies ?? []

  if (movies.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 bg-primary" />
          <Clapperboard className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="font-cinema-caps text-sm md:text-base tracking-[0.15em] text-primary uppercase">
            Your Shortlist
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
        </div>

        <div
          className="relative overflow-x-auto pb-6 pt-8 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 no-scrollbar"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, transparent 28px, var(--border) 28px, var(--border) 29px, transparent 29px)',
          }}
        >
          <div className="flex gap-6 md:gap-8">
            <motion.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 16, rotate: 0 }
              }
              animate={{ opacity: 1, y: 0, rotate: 0.5 }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotate: -2,
                      scale: 1.02,
                      transition: {
                        type: 'spring',
                        stiffness: 200,
                        damping: 10,
                      },
                    }
              }
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex-shrink-0 cursor-pointer"
              style={{ transformOrigin: 'top center' }}
            >
              <Clothespin />
              <div className="w-40 sm:w-44 pt-2.5 px-2.5 pb-8 rounded-sm shadow-md transition-shadow duration-300 hover:shadow-xl bg-[color-mix(in_oklch,white_95%,var(--primary)_5%)]">
                <div className="aspect-[2/3] flex flex-col items-center justify-center gap-3 bg-black/5 rounded-[1px]">
                  <Ticket className="h-10 w-10 text-black/20" />
                  <p className="text-xs text-[color-mix(in_oklch,black_70%,var(--primary)_30%)] font-medium">
                    Empty
                  </p>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-[11px] text-[color-mix(in_oklch,black_60%,var(--primary)_40%)]">
                    Find movies for the raffle
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 16, rotate: 0 }
              }
              animate={{ opacity: 1, y: 0, rotate: -1.5 }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotate: 2.5,
                      scale: 1.02,
                      transition: {
                        type: 'spring',
                        stiffness: 200,
                        damping: 10,
                      },
                    }
              }
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative flex-shrink-0"
              style={{ transformOrigin: 'top center' }}
            >
              <Clothespin />
              <Link
                to="/discover"
                className="block w-40 sm:w-44 pt-2.5 px-2.5 pb-8 rounded-sm shadow-md transition-shadow duration-300 hover:shadow-xl bg-[color-mix(in_oklch,white_95%,var(--primary)_5%)]"
              >
                <div className="aspect-[2/3] flex flex-col items-center justify-center gap-2 bg-black/5 rounded-[1px] border-2 border-dashed border-black/15">
                  <Plus className="h-8 w-8 text-[color-mix(in_oklch,black_50%,var(--primary)_50%)]" />
                  <span className="font-cinema-caps text-xs tracking-wider uppercase text-[color-mix(in_oklch,black_50%,var(--primary)_50%)]">
                    Discover
                  </span>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-[11px] text-[color-mix(in_oklch,black_60%,var(--primary)_40%)]">
                    Add your first pick
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-primary" />
          <Clapperboard className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="font-cinema-caps text-sm md:text-base tracking-[0.15em] text-primary uppercase">
            Your Shortlist
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
          </span>
        </div>
        {movies.length < 3 && (
          <Link
            to="/discover"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add more
          </Link>
        )}
      </div>

      <div
        className="relative overflow-x-auto pb-8 pt-10 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 no-scrollbar snap-x snap-mandatory"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, transparent 30px, var(--border) 30px, var(--border) 31px, transparent 31px)',
        }}
      >
        <div className="flex gap-5 md:gap-7">
          {movies.map((movie, index) => {
            const posterPath =
              (movie.images as any)?.posters?.[0]?.file_path ?? null
            const posterUrl = posterPath
              ? `https://image.tmdb.org/t/p/w342${posterPath}`
              : null
            const year = movie.releaseDate
              ? new Date(movie.releaseDate).getFullYear()
              : null
            const rotation = ROTATIONS[index % ROTATIONS.length]

            return (
              <motion.div
                key={movie.id}
                className="snap-start flex-shrink-0 relative group cursor-pointer"
                style={{ transformOrigin: 'top center' }}
                initial={
                  shouldReduceMotion ? false : { opacity: 0, y: 20, rotate: 0 }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: rotation,
                }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        rotate: rotation * -1.2,
                        scale: 1.03,
                        transition: {
                          type: 'spring',
                          stiffness: 200,
                          damping: 10,
                        },
                      }
                }
                transition={{
                  duration: 0.55,
                  delay: index * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Clothespin />
                <div className="w-32 sm:w-40 md:w-48 lg:w-52 pt-2.5 px-2.5 pb-7 rounded-sm shadow-md transition-shadow duration-300 hover:shadow-2xl bg-[color-mix(in_oklch,white_95%,var(--primary)_5%)]">
                  <div className="aspect-[2/3] overflow-hidden rounded-[1px] bg-black/5">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={movie.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Ticket className="h-8 w-8 text-black/20" />
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 text-center px-1">
                    <p className="text-xs font-semibold text-[color-mix(in_oklch,black_85%,var(--primary)_15%)] line-clamp-1 leading-tight group-hover:text-[color-mix(in_oklch,black_60%,var(--primary)_40%)] transition-colors duration-200">
                      {movie.title}
                    </p>
                    {year && (
                      <p className="text-[10px] text-[color-mix(in_oklch,black_55%,var(--primary)_45%)] mt-1 font-medium">
                        {year}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
