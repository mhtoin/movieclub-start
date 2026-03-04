import { Button } from '@/components/ui/button'
import type { Movie } from '@/db/schema/movies'
import { getImageUrl } from '@/lib/tmdb-api'
import { cn, getMovieBackdropUrl, getMoviePosterUrl } from '@/lib/utils'
import confetti from 'canvas-confetti'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  RefreshCw,
  Sparkles,
  Star,
  Trophy,
  Tv,
  Users,
} from 'lucide-react'
import { memo, useEffect, useMemo, useState } from 'react'

interface WinnerUser {
  id: string
  name: string
  image: string
}

interface Props {
  movie: Movie
  winnerUser: WinnerUser | null
  watchDate: Date | undefined
  dryRun: boolean
  onFinalize: () => Promise<void>
  onRerun: () => void
  isLoading: boolean
}

function formatRuntime(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function getDirector(crew: any[] | null | undefined): string | null {
  if (!crew) return null
  return crew.find((c) => c.job === 'Director')?.name ?? null
}

function getTopCast(cast: any[] | null | undefined, n = 6): any[] {
  if (!cast) return []
  return [...cast].sort((a, b) => a.order - b.order).slice(0, n)
}

function getProviders(watchProviders: Record<string, any> | null | undefined) {
  if (!watchProviders) return []
  if (Array.isArray(watchProviders.providers)) {
    return watchProviders.providers as any[]
  }
  const region =
    ['FI'].find((r) => watchProviders[r]) ?? Object.keys(watchProviders)[0]
  if (!region) return []
  const data = watchProviders[region]
  return (data?.flatrate ?? data?.buy ?? data?.rent ?? []) as any[]
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

function PageDots({
  page,
  count,
  onSelect,
}: {
  page: number
  count: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Page ${i + 1}`}
          className={cn(
            'h-1 rounded-full transition-all duration-300',
            i === page
              ? 'w-5 bg-primary'
              : 'w-1.5 bg-foreground/20 hover:bg-foreground/40',
          )}
        />
      ))}
    </div>
  )
}

const VictoryPage = memo(function VictoryPage({
  movie,
  winnerUser,
  watchDate,
  dryRun,
  posterUrl,
}: {
  movie: Movie
  winnerUser: WinnerUser | null
  watchDate: Date | undefined
  dryRun: boolean
  posterUrl: string | null
}) {
  const formattedDate = watchDate ? format(watchDate, 'd MMMM yyyy') : null

  return (
    <div className="min-h-full flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: 0.4,
            type: 'spring',
            stiffness: 250,
            damping: 20,
          }}
          className="w-44 sm:w-52 lg:w-72 xl:w-80 rounded-2xl overflow-hidden shadow-2xl border border-border/40 ring-4 ring-primary/30 shrink-0"
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full aspect-[2/3] object-cover"
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
        </motion.div>
        <div className="flex flex-col items-center lg:items-start gap-5 text-center lg:text-left flex-1">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              type: 'spring',
              stiffness: 400,
              damping: 18,
            }}
            className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center shadow-xl shadow-primary/20 shrink-0"
          >
            <Trophy className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-1">
              Tonight's pick
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-foreground leading-tight">
              {movie.title}
            </h1>
            {movie.releaseDate && (
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                {new Date(movie.releaseDate).getFullYear()}
                {movie.tagline ? ` · ${movie.tagline}` : ''}
              </p>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col items-center lg:items-start gap-2.5"
          >
            {winnerUser && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {winnerUser.image && (
                  <img
                    src={winnerUser.image}
                    alt={winnerUser.name}
                    className="w-6 h-6 rounded-full border border-border"
                  />
                )}
                <span>
                  Nominated by{' '}
                  <span className="font-semibold text-foreground">
                    {winnerUser.name}
                  </span>
                </span>
              </div>
            )}
            {formattedDate && (
              <p className="text-sm text-muted-foreground">
                Watch night:{' '}
                <span className="font-medium text-foreground">
                  {formattedDate}
                </span>
              </p>
            )}
            {dryRun && (
              <span className="text-xs bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full px-3 py-1 font-medium">
                Dry run — result not saved
              </span>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
})

const DetailsPage = memo(function DetailsPage({
  movie,
  posterUrl,
}: {
  movie: Movie
  posterUrl: string | null
}) {
  const year = useMemo(
    () =>
      movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null,
    [movie.releaseDate],
  )
  const director = useMemo(() => getDirector(movie.crew), [movie.crew])
  const topCast = useMemo(() => getTopCast(movie.cast), [movie.cast])
  const providers = useMemo(
    () => getProviders(movie.watchProviders),
    [movie.watchProviders],
  )
  const providerLink = useMemo(
    () => getProviderLink(movie.watchProviders),
    [movie.watchProviders],
  )

  return (
    <div className="min-h-full flex flex-col justify-center py-8">
      <div className="w-full max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex gap-4">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-24 sm:w-32 lg:w-44 shrink-0 rounded-xl object-cover shadow-xl border border-border/40"
            />
          )}
          <div className="flex-1 min-w-0 space-y-2 pt-1">
            <h2 className="text-xl sm:text-2xl font-black leading-tight text-foreground">
              {movie.title}
            </h2>
            {movie.tagline && (
              <p className="text-xs text-muted-foreground italic leading-snug">
                "{movie.tagline}"
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {year && <span>{year}</span>}
              {movie.runtime ? (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRuntime(movie.runtime)}
                </span>
              ) : null}
              {movie.voteAverage > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {movie.voteAverage.toFixed(1)}
                  {movie.voteCount > 0 && (
                    <span className="text-xs text-muted-foreground/60">
                      ({(movie.voteCount / 1000).toFixed(0)}k)
                    </span>
                  )}
                </span>
              )}
              {director && (
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  {director}
                </span>
              )}
            </div>
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {movie.genres.map((g: string) => (
                  <span
                    key={g}
                    className="text-[11px] bg-primary/10 text-primary rounded-full px-2.5 py-0.5 font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {movie.overview && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Overview
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {movie.overview}
            </p>
          </div>
        )}
        {topCast.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Cast
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {topCast.map((member) => {
                const profileUrl = member.profile_path
                  ? getImageUrl(member.profile_path, 'w185')
                  : null
                return (
                  <div
                    key={member.id}
                    className="flex flex-col items-center gap-1 text-center"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border border-border/40 shrink-0">
                      {profileUrl ? (
                        <img
                          src={profileUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">
                          {member.name?.[0] ?? '?'}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-medium leading-tight text-foreground line-clamp-1">
                      {member.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground leading-tight line-clamp-1">
                      {member.character}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {providers.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" /> Where to watch
            </h3>
            <div className="flex flex-wrap gap-2">
              {providers.map((p: any) => {
                const logoUrl = p.logo_path
                  ? getImageUrl(p.logo_path, 'w92')
                  : null
                const inner = (
                  <>
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt={p.provider_name}
                        className="w-5 h-5 rounded object-cover"
                      />
                    )}
                    <span className="text-xs font-medium text-foreground">
                      {p.provider_name}
                    </span>
                  </>
                )
                return providerLink ? (
                  <a
                    key={p.provider_id}
                    href={providerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-muted/50 border border-border/40 rounded-lg px-3 py-2 hover:bg-muted transition-colors"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={p.provider_id}
                    className="flex items-center gap-2 bg-muted/50 border border-border/40 rounded-lg px-3 py-2"
                  >
                    {inner}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

const PAGE_LABELS = ['Result', 'Details']
const SLIDE_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? '55%' : '-55%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-55%' : '55%', opacity: 0 }),
}

export function RaffleWinner({
  movie,
  winnerUser,
  watchDate,
  dryRun,
  onFinalize,
  onRerun,
  isLoading,
}: Props) {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const colors = [
      '#ff6b6b',
      '#ffd93d',
      '#6bcb77',
      '#4d96ff',
      '#f4a261',
      '#e9c46a',
    ]
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { x: 0.25, y: 0.6 },
      colors,
      startVelocity: 45,
    })
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { x: 0.75, y: 0.6 },
      colors,
      startVelocity: 45,
    })
    const id = setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors,
        gravity: 0.8,
      })
    }, 600)
    return () => clearTimeout(id)
  }, [])

  const posterUrl = useMemo(() => getMoviePosterUrl(movie, 'w500'), [movie])
  const backdropUrl = useMemo(
    () => getMovieBackdropUrl(movie, 'w1280'),
    [movie],
  )

  const goTo = (next: number) => {
    setDirection(next > page ? 1 : -1)
    setPage(next)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background"
    >
      {backdropUrl && (
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={backdropUrl}
            alt=""
            className="w-full h-full object-cover opacity-10 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/75 to-background" />
        </div>
      )}

      <div className="relative z-10 flex items-center justify-center gap-1 pt-4 pb-2 shrink-0">
        {PAGE_LABELS.map((label, i) => (
          <Button
            key={label}
            variant={i === page ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => goTo(i)}
            className={`rounded-full text-xs font-semibold ${
              i === page
                ? 'shadow-md shadow-primary/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 overflow-y-auto"
          >
            {page === 0 ? (
              <VictoryPage
                movie={movie}
                winnerUser={winnerUser}
                watchDate={watchDate}
                dryRun={dryRun}
                posterUrl={posterUrl}
              />
            ) : (
              <DetailsPage movie={movie} posterUrl={posterUrl} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 shrink-0 border-t border-border/30 bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goTo(Math.max(0, page - 1))}
            disabled={page === 0}
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-0"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex flex-col items-center gap-2.5 flex-1">
            <PageDots page={page} count={PAGE_LABELS.length} onSelect={goTo} />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full gap-2 h-8 text-xs"
                onClick={onRerun}
                disabled={isLoading}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-run
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="rounded-full gap-2 px-5 h-8 text-xs"
                onClick={onFinalize}
                loading={isLoading}
                disabled={isLoading || (!dryRun && !watchDate)}
              >
                <Trophy className="w-3.5 h-3.5" />
                {dryRun ? 'Done (dry run)' : 'Confirm & Finalize'}
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => goTo(Math.min(PAGE_LABELS.length - 1, page + 1))}
            disabled={page === PAGE_LABELS.length - 1}
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-0"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
