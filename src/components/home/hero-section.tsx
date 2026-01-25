import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { fadeInUp, staggerContainer } from './animation-variants'
import { HeroActions } from './hero-actions'
import { HeroBackdrop, ScrollIndicator } from './hero-backdrop'
import { useMovieInfoSlides } from './movie-info-slides'
import { MoviePosterCard } from './movie-poster-card'
import { SlideTabs } from './slide-tabs'

interface MovieUser {
  name: string | null
  email: string | null
}

interface MovieData {
  title: string
  tagline: string | null
  overview: string
  releaseDate: string | null
  runtime: number | null
  voteAverage: number
  voteCount: number
  originalLanguage: string | null
  genres: string[] | null
  cast: any[] | null
  crew: any[] | null
  watchDate: string | null
  imdbId: string | null
  tmdbId: number | null
  videos: Record<string, any> | null
  watchProviders: Record<string, any> | null
  images?: {
    backdrops?: { file_path: string }[]
    posters?: { file_path: string }[]
    logos?: { file_path: string }[]
  } | null
}

interface HeroSectionProps {
  movie: MovieData
  movieUser: MovieUser
}

export function HeroSection({ movie, movieUser }: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [slideDirection, setSlideDirection] = useState(0)

  // Extract image URLs
  const backdropPath = movie.images?.backdrops?.[0]?.file_path
  const posterPath = movie.images?.posters?.[0]?.file_path
  const logoPath = movie.images?.logos?.[0]?.file_path
  const backdropUrl = backdropPath
    ? `https://image.tmdb.org/t/p/original${backdropPath}`
    : ''
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : ''
  const logoUrl = logoPath ? `https://image.tmdb.org/t/p/w500${logoPath}` : ''

  // Format dates and metadata
  const formattedWatchDate = movie.watchDate
    ? new Date(movie.watchDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  // Extract links
  const trailerKey = Array.isArray(movie.videos) ? movie.videos?.[0]?.key : null
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

  // Get slides for movie info
  const slides = useMovieInfoSlides({ movie })

  const handleSlideChange = (newIndex: number) => {
    setSlideDirection(newIndex > activeSlide ? 1 : -1)
    setActiveSlide(newIndex)
  }

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      <HeroBackdrop backdropUrl={backdropUrl} title={movie.title} />
      <div className="relative flex min-h-[100svh] items-end pb-8 md:items-center md:pb-0">
        <div className="w-full px-4 pt-20 sm:px-6 md:px-12 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center lg:gap-12 xl:grid-cols-[1fr_340px]">
              <motion.div
                className="flex flex-col gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Latest Watch
                </motion.div>

                <motion.div variants={fadeInUp}>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={movie.title}
                      className="h-12 w-auto max-w-[280px] object-contain drop-shadow-lg dark:drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)] dark:brightness-110 sm:h-14 lg:h-16"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-lg sm:text-4xl lg:text-5xl">
                      {movie.title}
                    </h1>
                  )}
                </motion.div>

                {movie.tagline && (
                  <motion.p
                    variants={fadeInUp}
                    className="text-sm italic text-foreground/70"
                  >
                    "{movie.tagline}"
                  </motion.p>
                )}
                <motion.div variants={fadeInUp}>
                  <SlideTabs
                    slides={slides}
                    activeSlide={activeSlide}
                    slideDirection={slideDirection}
                    onSlideChange={handleSlideChange}
                  />
                </motion.div>

                <HeroActions
                  trailerLink={trailerLink}
                  providerLink={providerLink}
                  formattedWatchDate={formattedWatchDate}
                  tmdbLink={tmdbLink}
                  imdbLink={imdbLink}
                />
              </motion.div>

              <MoviePosterCard
                title={movie.title}
                posterUrl={posterUrl}
                movieUser={movieUser}
              />
            </div>
          </div>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  )
}
