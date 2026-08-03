import { memo } from 'react'
import { Link } from '@tanstack/react-router'
import { m, useReducedMotion } from 'framer-motion'
import { format } from 'date-fns'
import {
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  Film,
  MessageCircle,
  Star,
  Ticket,
  Trophy,
} from 'lucide-react'
import type { MovieWithCredits } from '@/db/schema/movies'

interface MarqueeHeroProps {
  movie: MovieWithCredits | null
  userId: string
  pickedBy: string | null
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

function FilmstripPoster({ path }: { path: string }) {
  return (
    <div className="relative h-48 w-32 shrink-0 overflow-hidden rounded-xl border border-card-foreground/10 opacity-40 shadow-2xl sm:h-64 sm:w-44">
      <img
        src={`https://image.tmdb.org/t/p/w342${path}`}
        alt=""
        className="h-full w-full object-cover grayscale-[35%]"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-card/35" />
    </div>
  )
}

export const MarqueeHero = memo(function MarqueeHero({
  movie,
  userId,
  pickedBy,
}: MarqueeHeroProps) {
  const shouldReduceMotion = useReducedMotion()

  if (!movie) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-muted/40 border border-border/20 p-8 md:p-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-5">
            <span className="relative flex size-2.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full bg-primary/40 ${shouldReduceMotion ? '' : 'animate-ping'}`}
              />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary/60" />
            </span>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              Getting Started
            </span>
          </div>
          <h2 className="font-cinema text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Your next movie night awaits
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md">
            Discover movies, build your shortlist, and pick what to watch
            together.
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
  const posterPaths = ((movie.images as any)?.posters ?? [])
    .flatMap((poster: { file_path?: string }) =>
      poster.file_path ? [poster.file_path] : [],
    )
    .slice(0, 6) as Array<string>
  const filmstripPosters =
    posterPaths.length > 0 ? posterPaths : posterPath ? [posterPath] : []

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
  const tickerCopy = [
    pickedBy ? `Picked by ${pickedBy}` : 'Picked by the club',
    'Latest club pick',
    `${movie.voteAverage.toFixed(1)} member rating`,
  ]

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-card text-card-foreground shadow-2xl shadow-foreground/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_45%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_30%),linear-gradient(115deg,color-mix(in_oklch,var(--card-foreground)_4%,transparent),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(90deg,var(--card)_0%,transparent_22%,transparent_80%,var(--card)_100%)]" />

      <div className="relative border-b border-card-foreground/10 px-5 py-4 sm:px-8">
        <div className="flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary shadow-[0_0_14px_color-mix(in_oklch,var(--primary)_90%,transparent)]" />
            MovieClub presents
          </span>
          <span className="hidden text-card-foreground/40 sm:block">
            Screening 04 / Member pick
          </span>
        </div>
      </div>

      <div className="relative grid min-h-[680px] grid-cols-1 items-center gap-10 px-5 py-12 sm:px-8 md:px-12 lg:min-h-[620px] lg:grid-cols-12 lg:gap-8 lg:px-14 lg:py-14">
        <div className="relative z-10 lg:col-span-5">
          <m.div
            className="order-2 lg:order-1"
            initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="relative flex size-2.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-primary/60 ${shouldReduceMotion ? '' : 'animate-ping'}`}
                />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Now showing
              </span>
            </div>

            <h1 className="font-cinema text-5xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-card-foreground md:text-7xl xl:text-[5.8rem]">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="mt-5 max-w-md text-base leading-relaxed text-card-foreground/60 md:text-lg">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-card-foreground/60">
              {movie.watchDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  {format(movie.watchDate, 'MMM d, yyyy')}
                </span>
              )}
              {releaseYear && <span>{releaseYear}</span>}
              {formattedRuntime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" />
                  {formattedRuntime}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 font-medium text-card-foreground/80">
                <Star className="size-3.5 fill-warning text-warning" />
                {movie.voteAverage.toFixed(1)}
              </span>
            </div>

            {genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-card-foreground/15 bg-card-foreground/5 px-3 py-1 text-xs font-medium text-card-foreground/70"
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
                        className="size-7 overflow-hidden rounded-md border border-card-foreground/20 bg-card-foreground/10 shadow-sm transition-transform hover:scale-110"
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
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#01b4e4]/10 px-2.5 py-1 text-xs font-semibold text-[#62d8f4] transition-colors hover:bg-[#01b4e4]/15"
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
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#F5C518]/10 px-2.5 py-1 text-xs font-semibold text-[#f5c518] transition-colors hover:bg-[#F5C518]/15"
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
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_color-mix(in_oklch,var(--primary)_20%,transparent)] transition-[transform,box-shadow] duration-150 ease-out hover:scale-[1.02] hover:shadow-[0_12px_30px_color-mix(in_oklch,var(--primary)_30%,transparent)] active:scale-[0.98]"
              >
                <Trophy className="size-4" />
                Rank it
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/watched/$movieId"
                params={{ movieId: movie.id }}
                className="group inline-flex items-center gap-2 rounded-full border border-card-foreground/20 bg-card-foreground/5 px-6 py-3 text-sm font-semibold text-card-foreground transition-[background-color,border-color,transform] duration-150 ease-out hover:border-card-foreground/40 hover:bg-card-foreground/10 active:scale-[0.98]"
              >
                <MessageCircle className="size-4" />
                Club reviews
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/watched"
                className="inline-flex items-center gap-2 rounded-full px-2 py-2.5 text-sm font-medium text-card-foreground/50 transition-[color,transform] duration-150 ease-out hover:text-card-foreground active:scale-[0.98]"
              >
                <Film className="size-4 text-foreground/60" />
                Watch history
              </Link>
            </div>
          </m.div>
        </div>
        <m.div
          className="relative order-1 min-h-[330px] lg:col-span-7 lg:order-2"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            {filmstripPosters.length > 0 && (
              <div
                className={`flex w-max ${shouldReduceMotion ? '' : 'animate-filmstrip'}`}
              >
                <div className="flex w-max shrink-0 gap-4 pr-4">
                  {filmstripPosters.map((path) => (
                    <FilmstripPoster key={`${path}-first`} path={path} />
                  ))}
                </div>
                <div className="flex w-max shrink-0 gap-4 pr-4">
                  {filmstripPosters.map((path) => (
                    <FilmstripPoster key={`${path}-second`} path={path} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative mx-auto w-52 sm:w-64 lg:w-72">
            <div
              className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-card-foreground/20 shadow-[0_30px_80px_color-mix(in_oklch,var(--foreground)_55%,transparent)]"
              style={{
                transform: 'rotate(3deg)',
              }}
            >
              {posterUrl ? (
                <Link to="/watched/$movieId" params={{ movieId: movie.id }}>
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                    loading="eager"
                    decoding="async"
                  />
                </Link>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Ticket className="size-16 text-muted-foreground/25" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-card-foreground/10" />
            </div>
            <div className="absolute -bottom-5 -left-10 rounded-lg border border-card-foreground/15 bg-card/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary shadow-xl backdrop-blur-sm">
              <span className="block text-card-foreground/40">
                Club feature
              </span>
              {releaseYear ?? 'Tonight'}
            </div>
          </div>
        </m.div>
      </div>
      <div className="relative overflow-hidden border-t border-card-foreground/10 bg-card-foreground/5 py-3">
        <div
          className={`flex w-max items-center whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.26em] text-card-foreground/35 ${shouldReduceMotion ? '' : 'animate-ticker'}`}
        >
          {Array.from({ length: 2 }, (_, groupIndex) => (
            <span
              key={groupIndex}
              className="flex shrink-0 items-center gap-8 pr-8"
            >
              {Array.from({ length: 3 }, (repeatIndex) =>
                tickerCopy.map((copy, copyIndex) => (
                  <span
                    key={`${repeatIndex}-${copyIndex}`}
                    className="flex items-center gap-8"
                  >
                    <span>{copy}</span>
                    <span className="text-primary">✦</span>
                  </span>
                )),
              )}
            </span>
          ))}
        </div>
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
