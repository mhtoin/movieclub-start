import { useSuspenseQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Ticket, Users } from 'lucide-react'
import { useRef, useState } from 'react'
import type { TMDBMovie } from '@/lib/react-query/queries/home'
import { Button } from '@/components/ui/button'
import { homeQueries } from '@/lib/react-query/queries/home'

interface RecommendationsSectionProps {
  userId: string
}

const ITEMS_PER_PAGE = 6

export function RecommendationsSection({
  userId,
}: RecommendationsSectionProps) {
  const { data: recommendations } = useSuspenseQuery(
    homeQueries.recommendations(userId),
  )

  if (!recommendations.length) return null

  const movies = recommendations as unknown as Array<TMDBMovie>
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [page, setPage] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)

  const featured = movies[featuredIndex]
  const rest = movies.slice(1)
  const totalPages = Math.ceil(rest.length / ITEMS_PER_PAGE)
  const visibleRest = rest.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  )

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1)
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage(page + 1)
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSelect = (index: number) => {
    setFeaturedIndex(index)
  }

  return (
    <section className="relative py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-cinema-caps text-2xl font-bold tracking-wide text-foreground uppercase md:text-3xl">
                Shortlist Picks
              </h2>
              <p className="text-sm text-foreground/60">
                Based on your top ranked films
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FeaturedCard movie={featured} />
          </motion.div>

          <div className="relative">
            <div
              ref={scrollRef}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 lg:max-h-[420px] lg:overflow-y-auto lg:pr-2 no-scrollbar"
            >
              {visibleRest.map((movie, index) => (
                <motion.div
                  key={`${movie.id}-${page}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CompactCard
                    movie={movie}
                    isSelected={
                      featuredIndex === index + 1 + page * ITEMS_PER_PAGE
                    }
                    onSelect={() =>
                      handleSelect(index + 1 + page * ITEMS_PER_PAGE)
                    }
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-2"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={page === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1.5 px-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPage(i)
                    scrollRef.current?.scrollTo({
                      top: 0,
                      behavior: 'smooth',
                    })
                  }}
                  className={`h-2 w-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    i === page
                      ? 'w-5 bg-primary'
                      : 'bg-foreground/20 hover:bg-foreground/40'
                  }`}
                  aria-label={`Page ${i + 1}`}
                  aria-current={i === page ? 'page' : undefined}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={page === totalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-4 flex items-center justify-center gap-2 text-xs text-foreground/40"
        >
          <Users className="h-3 w-3" />
          <span>
            {rest.length} films
            {totalPages > 1 && ` · Page ${page + 1} of ${totalPages}`}
          </span>
        </motion.div>
      </div>
    </section>
  )
}

function FeaturedCard({ movie }: { movie: TMDBMovie }) {
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : null
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null

  return (
    <div className="group relative overflow-hidden rounded-2xl">
      <div className="aspect-[16/10] w-full bg-muted">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Ticket className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded-full border border-warning/40 bg-warning/20 px-2.5 py-1 text-xs font-semibold text-warning">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {movie.vote_average.toFixed(1)}
            </span>
          </span>
          {year && (
            <span className="text-sm font-medium text-white/80">{year}</span>
          )}
          {movie.becauseYouLiked && (
            <span className="rounded-full border border-primary/40 bg-primary/20 px-2.5 py-1 text-xs font-medium text-primary">
              Because you liked {movie.becauseYouLiked.title}
            </span>
          )}
        </div>

        <h3 className="mb-2 font-cinema-caps text-3xl font-bold tracking-wide text-white uppercase md:text-4xl">
          {movie.title}
        </h3>

        {movie.overview && (
          <p className="line-clamp-2 text-sm leading-relaxed text-white/70">
            {movie.overview}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            className="shadow-lg shadow-primary/30"
          >
            Add to Watch
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          >
            Details
          </Button>
        </div>
      </div>

      <div className="absolute right-4 top-4 flex items-center gap-2">
        <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
          Featured
        </span>
      </div>
    </div>
  )
}

function CompactCard({
  movie,
  isSelected,
  onSelect,
}: {
  movie: TMDBMovie
  isSelected: boolean
  onSelect: () => void
}) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w342${movie.backdrop_path}`
    : null
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null

  return (
    <button
      onClick={onSelect}
      className={`group relative flex w-full gap-4 rounded-xl border p-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isSelected
          ? 'border-primary/50 bg-primary/10'
          : 'border-border/50 bg-background/60 hover:bg-background/80 hover:border-border'
      }`}
    >
      <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : backdropUrl ? (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Ticket className="h-6 w-6 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-1 right-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {movie.vote_average.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <h4 className="line-clamp-1 text-sm font-semibold text-foreground">
          {movie.title}
        </h4>
        {year && <span className="text-xs text-foreground/50">{year}</span>}
        {movie.becauseYouLiked && (
          <span className="mt-1 line-clamp-1 text-xs text-primary/80">
            Because you liked {movie.becauseYouLiked.title}
          </span>
        )}
      </div>

      {isSelected && (
        <div className="absolute -left-px top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
    </button>
  )
}
