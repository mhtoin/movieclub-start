import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { Calendar, Film, Layers } from 'lucide-react'
import { DeleteButton } from './delete-button'
import type { TierlistPreview } from '@/lib/react-query/queries/tierlists'
import { getImageUrl } from '@/lib/tmdb-api'

interface PolaroidTierlistCardProps {
  tierlist: TierlistPreview
  userId: string
  isOwner: boolean
  index?: number
}

function getScatterValues(index: number) {
  const rotations = [-2.5, 1.5, -1, 2, -3, 0.5, -1.5, 2.5, -2, 3, -0.5, 1.5]
  const yOffsets = [0, 12, 4, 16, 8, 20, 2, 14, 6, 18, 10, 22]
  return {
    rotation: rotations[index % rotations.length],
    yOffset: yOffsets[index % yOffsets.length],
  }
}

function formatDateRange(
  from: string | null,
  to: string | null,
): string | null {
  if (!from && !to) return null

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })

  if (from && to) return `${fmt(from)} — ${fmt(to)}`
  if (from) return `From ${fmt(from)}`
  if (to) return `Until ${fmt(to)}`
  return null
}

function PosterCollage({ paths }: { paths: Array<string> }) {
  if (paths.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Film className="h-8 w-8 text-muted-foreground/25" />
      </div>
    )
  }

  if (paths.length === 1) {
    return (
      <img
        src={getImageUrl(paths[0], 'w342') ?? undefined}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
    )
  }

  if (paths.length === 2) {
    return (
      <div className="grid h-full w-full grid-cols-2 gap-0.5">
        {paths.map((p, i) => (
          <img
            key={i}
            src={getImageUrl(p, 'w342') ?? undefined}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ))}
      </div>
    )
  }

  if (paths.length === 3) {
    return (
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
        <div className="row-span-2">
          <img
            src={getImageUrl(paths[0], 'w342') ?? undefined}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        {paths.slice(1).map((p, i) => (
          <img
            key={i}
            src={getImageUrl(p, 'w342') ?? undefined}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
      {paths.slice(0, 4).map((p, i) => (
        <img
          key={i}
          src={getImageUrl(p, 'w342') ?? undefined}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ))}
    </div>
  )
}

export function PolaroidTierlistCard({
  tierlist,
  userId,
  isOwner,
  index = 0,
}: PolaroidTierlistCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const { rotation, yOffset } = getScatterValues(index)
  const dateRange = formatDateRange(
    tierlist.watchDateFrom,
    tierlist.watchDateTo,
  )

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: -40, rotate: rotation - 8, scale: 0.88 }
      }
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: yOffset, rotate: rotation, scale: 1 }
      }
      transition={{
        type: 'spring',
        stiffness: 220,
        damping: 18,
        delay: index * 0.06,
      }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: yOffset - 14,
              rotate: 0,
              scale: 1.07,
              zIndex: 50,
              transition: { type: 'spring', stiffness: 400, damping: 15 },
            }
      }
      whileTap={{ scale: 0.95 }}
      style={{ transformOrigin: 'center center' }}
      className="relative"
    >
      <Link
        to="/tierlist/$userId/$tierlistId"
        params={{ userId, tierlistId: tierlist.id }}
        className="group block"
      >
        <article
          className="relative overflow-hidden rounded-sm bg-card transition-shadow duration-300 group-hover:shadow-2xl"
          style={{
            padding: '10px 10px 14px 10px',
            boxShadow:
              '0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)',
          }}
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-muted">
            <PosterCollage paths={tierlist.posterPaths.slice(0, 4)} />
          </div>

          <div className="mt-3 px-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="flex-1 text-lg font-bold leading-tight tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary truncate"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {tierlist.title || 'Untitled'}
              </h3>
              {isOwner && (
                <DeleteButton
                  tierlistId={tierlist.id}
                  userId={userId}
                  compact
                />
              )}
            </div>

            {dateRange && (
              <p className="mt-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80">
                <Calendar className="h-3 w-3" />
                {dateRange}
              </p>
            )}

            <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {tierlist.tierCount} tiers
              </span>
              <span className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                {tierlist.movieCount} films
              </span>
            </div>

            {tierlist.genres && tierlist.genres.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {tierlist.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
