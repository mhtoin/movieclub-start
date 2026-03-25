import { Button } from '@/components/ui/button'
import type { MovieWithCredits } from '@/db/schema/movies'
import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Film,
  Play,
  Star,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { fadeInUp, staggerContainer } from './animation-variants'
import { HeroBackdrop } from './hero-backdrop'

interface HeroSectionProps {
  movie: MovieWithCredits
}

export function HeroSection({ movie }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion()
  const [showFullOverview, setShowFullOverview] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHasScrolled(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const backdropPath = movie.images?.backdrops?.[0]?.file_path
  const logoPath = movie.images?.logos?.[0]?.file_path
  const backdropUrl = backdropPath
    ? `https://image.tmdb.org/t/p/w1280${backdropPath}`
    : ''
  const logoUrl = logoPath ? `https://image.tmdb.org/t/p/w500${logoPath}` : ''

  const formattedWatchDate = movie.watchDate
    ? new Date(movie.watchDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const trailerKey = Array.isArray(movie.videos) ? movie.videos[0]?.key : null
  const trailerLink = trailerKey
    ? `https://www.youtube.com/watch?v=${trailerKey}`
    : null
  const providerLink = movie.watchProviders?.link || null
  const imdbLink = movie.imdbId
    ? `https://www.imdb.com/title/${movie.imdbId}`
    : null
  const tmdbLink = movie.tmdbId
    ? `https://www.themoviedb.org/movie/${movie.tmdbId}`
    : null

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null
  const formattedRuntime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null
  const cast = Array.isArray(movie.cast) ? movie.cast.slice(0, 8) : []
  const crew = Array.isArray(movie.crew)
    ? movie.crew.filter((c) => c.job === 'Director').slice(0, 2)
    : []
  const genres = movie.genres?.slice(0, 3) || []

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      <HeroBackdrop backdropUrl={backdropUrl} title={movie.title} />

      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

      <div className="relative flex min-h-[100svh] flex-col justify-end pb-16">
        <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16">
          <motion.div
            className="mx-auto max-w-7xl px-5"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={movie.title}
                  className="h-24 w-auto max-w-[400px] object-contain drop-shadow-2xl sm:h-28 md:h-32 lg:h-36"
                />
              ) : (
                <h1 className="font-cinema-caps text-5xl font-bold tracking-wide text-foreground drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl uppercase">
                  {movie.title}
                </h1>
              )}
            </motion.div>

            {movie.tagline && (
              <motion.p
                variants={fadeInUp}
                className="mb-6 text-lg italic text-foreground/70 sm:text-xl"
              >
                "{movie.tagline}"
              </motion.p>
            )}

            <motion.div
              variants={fadeInUp}
              className="mb-8 flex flex-wrap items-center gap-3"
            >
              {releaseYear && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                  <Calendar className="h-4 w-4 text-secondary" />
                  {releaseYear}
                </span>
              )}
              {formattedRuntime && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                  <Clock className="h-4 w-4 text-secondary" />
                  {formattedRuntime}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-warning">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {movie.voteAverage.toFixed(1)}
              </span>
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-medium text-primary"
                >
                  {genre}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="mb-8 max-w-2xl">
              <p
                className={`text-sm leading-relaxed text-foreground/80 ${
                  showFullOverview ? '' : 'line-clamp-2'
                }`}
              >
                {movie.overview}
              </p>
              {movie.overview && movie.overview.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullOverview(!showFullOverview)}
                  className="mt-2 h-auto min-h-[24px] gap-1.5 px-0 text-xs font-medium text-primary hover:text-primary/80 hover:bg-transparent"
                >
                  {showFullOverview ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <span>Read more</span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </Button>
              )}
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mb-10 flex flex-wrap items-center gap-3"
            >
              {trailerLink && (
                <a
                  href={trailerLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Watch Trailer
                </a>
              )}
              {providerLink && (
                <a
                  href={providerLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-background hover:border-foreground/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Film className="h-4 w-4" />
                  Stream Now
                </a>
              )}
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Explore more
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </motion.div>

            {cast.length > 0 && (
              <motion.div variants={fadeInUp} className="mb-8">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-foreground/50" />
                  <span className="text-xs font-medium uppercase tracking-wider text-foreground/50">
                    Cast
                  </span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {cast.map((member) => (
                    <div
                      key={member.id ?? member.name}
                      className="flex flex-col items-center gap-1.5 flex-shrink-0"
                    >
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-foreground/20 bg-muted">
                        {member.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                            alt={member.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-foreground/50">
                            {member.name?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="max-w-[70px] truncate text-center text-[10px] font-medium text-foreground/70">
                        {member.name?.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-foreground/50"
            >
              {formattedWatchDate && (
                <span className="flex items-center gap-1">
                  <Film className="h-3 w-3" />
                  Watched {formattedWatchDate}
                </span>
              )}
              {crew.length > 0 && (
                <span>Directed by {crew.map((c) => c.name).join(', ')}</span>
              )}
              <div className="flex items-center gap-3">
                {tmdbLink && (
                  <a
                    href={tmdbLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    TMDB
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {imdbLink && (
                  <a
                    href={imdbLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    IMDb
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: hasScrolled ? 0 : 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <motion.div
          animate={
            shouldReduceMotion || hasScrolled
              ? {}
              : {
                  y: [0, 6, 0],
                }
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex flex-col items-center gap-1 text-foreground/40"
        >
          <span className="text-[9px] uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  )
}
