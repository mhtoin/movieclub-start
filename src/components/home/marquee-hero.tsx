import { memo } from 'react'
import { Link } from '@tanstack/react-router'
import { m, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  Film,
  Star,
  Ticket,
  Trophy,
} from 'lucide-react'
import type { MovieWithCredits } from '@/db/schema/movies'

interface MarqueeHeroProps {
  movie: MovieWithCredits | null
  userId: string
}

function getProviders(watchProviders: Record<string, any> | null | undefined) {
  if (!watchProviders) return []
  if (Array.isArray(watchProviders.providers)) {
    return watchProviders.providers
  }
  const region =
    ['FI'].find((r) => watchProviders[r]) ?? Object.keys(watchProviders)[0]
  if (!region) return []
  const data = watchProviders[region]
  return (data?.flatrate ?? data?.buy ?? data?.rent ?? []) as Array<any>
}

function getProviderLink(
  watchProviders: Record<string, any> | null | undefined,
): string | null {
  if (!watchProviders) return null
  if (typeof watchProviders.link === 'string' && watchProviders.link) {
    return watchProviders.link
  }
  const region =
    ['FI'].find((r) => watchProviders[r]) ?? Object.keys(watchProviders)[0]
  return watchProviders[region]?.link ?? null
}

export const MarqueeHero = memo(function MarqueeHero({
  movie,
  userId,
}: MarqueeHeroProps) {
  const shouldReduceMotion = useReducedMotion()

  if (!movie) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-muted/40 border border-border/20 p-8 md:p-12">
        <div className="max-w-lg">
          <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Welcome to MovieClub
          </span>
          <h2 className="mt-3 font-cinema text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Start your journey
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md">
            Discover movies, build your shortlist, and watch together with
            friends.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Ticket className="size-4" />
              Discover movies
            </Link>
            <Link
              to="/shortlists"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              View shortlists
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const posterPath = (movie.images as any)?.posters?.[0]?.file_path ?? null
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null
  const formattedRuntime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null
  const genres = movie.genres?.slice(0, 3) ?? []

  const tmdbLink = movie.tmdbId
    ? `https://www.themoviedb.org/movie/${movie.tmdbId}`
    : null
  const imdbLink = movie.imdbId
    ? `https://www.imdb.com/title/${movie.imdbId}`
    : null
  const providerLink = getProviderLink(movie.watchProviders)
  const providers = getProviders(movie.watchProviders).slice(0, 4)

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <m.div
          className="lg:col-span-5 xl:col-span-5 order-2 lg:order-1"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-primary/60" />
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              Last Watched
            </span>
          </div>

          <h1 className="font-cinema text-4xl md:text-5xl xl:text-6xl font-semibold tracking-tight text-foreground leading-[1.05]">
            {movie.title}
          </h1>

          {movie.tagline && (
            <p className="mt-4 text-base md:text-lg italic text-muted-foreground leading-relaxed max-w-md">
              &ldquo;{movie.tagline}&rdquo;
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/70">
            {releaseYear && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary/70" />
                {releaseYear}
              </span>
            )}
            {formattedRuntime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary/70" />
                {formattedRuntime}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
              <Star className="size-3.5 fill-warning text-warning" />
              {movie.voteAverage.toFixed(1)}
            </span>
          </div>

          {genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-foreground/70"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {providers.length > 0 && (
              <div className="flex items-center gap-2">
                {providers.map((provider: any) =>
                  provider.logo_path ? (
                    <a
                      key={provider.provider_id}
                      href={providerLink ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={provider.provider_name}
                      className="size-7 rounded-md overflow-hidden bg-background border border-border/40 shadow-sm hover:scale-110 transition-transform"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  ) : null,
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              {tmdbLink && (
                <a
                  href={tmdbLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#01b4e4]/10 px-2.5 py-1 text-xs font-semibold text-[#01b4e4] hover:bg-[#01b4e4]/15 transition-colors"
                >
                  <span>TMDb</span>
                  <ExternalLink className="size-3" />
                </a>
              )}
              {imdbLink && (
                <a
                  href={imdbLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#F5C518]/10 px-2.5 py-1 text-xs font-semibold text-[#c4a000] hover:bg-[#F5C518]/15 transition-colors"
                >
                  <span>IMDb</span>
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/tierlist/$userId"
              params={{ userId }}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
            >
              <Trophy className="size-4" />
              Rank it
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/watched"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent active:scale-[0.98]"
            >
              <Film className="size-4 text-foreground/60" />
              Watch history
            </Link>
          </div>
        </m.div>
        <m.div
          className="lg:col-span-7 xl:col-span-7 order-1 lg:order-2"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className="relative mx-auto lg:mx-0 lg:ml-auto max-w-sm lg:max-w-md">
            <div
              className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-2xl"
              style={{
                boxShadow:
                  '0 25px 60px -12px color-mix(in oklch, var(--foreground) 25%, transparent)',
              }}
            >
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Ticket className="size-16 text-muted-foreground/25" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>
            <div
              className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl border border-primary/20 bg-primary/5"
              aria-hidden="true"
            />
          </div>
        </m.div>
      </div>
    </div>
  )
})

export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div className="space-y-6">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-12 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
          <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
      <div className="aspect-[2/3] max-h-[480px] animate-pulse rounded-2xl bg-muted" />
    </div>
  )
}
