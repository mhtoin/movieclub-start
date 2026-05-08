import type { TierlistPreview } from '@/lib/react-query/queries/tierlists'
import { getImageUrl } from '@/lib/tmdb-api'
import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, Layers } from 'lucide-react'
import { DeleteButton } from './delete-button'

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1]

const posterVariants = {
  initial: { opacity: 0, scale: 0.8, y: 30 },
  animate: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.07,
      duration: 0.6,
      ease: easeOut,
    },
  }),
}

const contentVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.3, duration: 0.5, ease: easeOut },
  },
}

const tagVariants = {
  initial: { opacity: 0, y: 6 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.45 + i * 0.04,
      duration: 0.35,
      ease: easeOut,
    },
  }),
}

const posterTransforms = [
  { rotate: -4, z: 0, overlap: 0, lift: 0 },
  { rotate: 2, z: 1, overlap: -16, lift: -4 },
  { rotate: -1.5, z: 2, overlap: -16, lift: 2 },
  { rotate: 3, z: 3, overlap: -16, lift: -2 },
  { rotate: -2.5, z: 4, overlap: -16, lift: 4 },
  { rotate: 1.5, z: 5, overlap: -16, lift: -3 },
]

//
function lobbySeed(i: number) {
  return {
    rotate: ((i * 47) % 28) - 14,
    scale: 0.9 + ((i * 31) % 30) / 100,
    x: ((i * 73) % 24) - 12,
    y: ((i * 59) % 24) - 12,
    opacity: 0.07 + ((i * 13) % 5) / 100,
  }
}

function LobbyWall({
  posterPaths,
  shouldReduceMotion,
}: {
  posterPaths: string[]
  shouldReduceMotion: boolean | null
}) {
  const tiles = posterPaths.slice(0, 12)
  const cols = 4

  return (
    <div
      className="lobby-wall absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="lobby-wall__grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${Math.ceil(tiles.length / cols)}, 1fr)`,
          gap: '4px',
          padding: '4px',
          height: '100%',
          width: '100%',
          transform: shouldReduceMotion ? undefined : 'scale(1.15)',
        }}
      >
        {tiles.map((path, i) => {
          const s = lobbySeed(i)
          const url = getImageUrl(path, 'w342')
          return (
            <div
              key={i}
              className="relative overflow-hidden"
              style={{
                transform: `rotate(${s.rotate}deg) translate(${s.x}px, ${s.y}px) scale(${s.scale})`,
                opacity: s.opacity,
                borderRadius: '6px',
              }}
            >
              {url ? (
                <img
                  src={url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
            </div>
          )
        })}
      </div>
      <div className="absolute inset-0 bg-black/45" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card/90 via-card/50 to-transparent" />
    </div>
  )
}

export function FeaturedTierlist({
  tierlist,
  userId,
  isOwner,
}: {
  tierlist: TierlistPreview
  userId: string
  isOwner: boolean
}) {
  const posterPaths = tierlist.posterPaths.slice(0, 6)
  const shouldReduceMotion = useReducedMotion()

  const dateRange = formatTierlistDateRange(
    tierlist.watchDateFrom,
    tierlist.watchDateTo,
  )

  return (
    <Link
      to="/tierlist/$userId/$tierlistId"
      params={{ userId, tierlistId: tierlist.id }}
      className="group block"
    >
      <motion.article
        layout
        className="relative overflow-hidden rounded-2xl bg-card"
      >
        <LobbyWall
          posterPaths={tierlist.posterPaths}
          shouldReduceMotion={shouldReduceMotion}
        />

        {posterPaths.length > 0 && (
          <div className="relative z-10 pt-6 md:pt-8 pb-2">
            <motion.div
              className="flex items-end justify-center px-4"
              initial="initial"
              animate="animate"
            >
              <div className="flex items-end">
                {posterPaths.map((path, idx) => {
                  const posterUrl = getImageUrl(path, 'w342')
                  const t = posterTransforms[idx] ?? posterTransforms[0]
                  return (
                    <motion.div
                      key={idx}
                      custom={idx}
                      variants={shouldReduceMotion ? undefined : posterVariants}
                      initial={shouldReduceMotion ? undefined : 'initial'}
                      animate={shouldReduceMotion ? undefined : 'animate'}
                      className={
                        'relative shrink-0 featured-poster-item' +
                        (idx > 0 ? ' featured-poster-item--offset' : '')
                      }
                      style={{
                        marginLeft: idx === 0 ? 0 : `${t.overlap}px`,
                        zIndex: t.z,
                        ['--fp-rotate' as string]: `${t.rotate}deg`,
                        ['--fp-lift' as string]: `${t.lift}px`,
                        ['--fp-overlap' as string]:
                          idx === 0 ? '0px' : `${t.overlap}px`,
                        transform: shouldReduceMotion
                          ? undefined
                          : `rotate(${t.rotate}deg) translateY(${t.lift}px)`,
                      }}
                    >
                      <div
                        className="w-[72px] md:w-[100px] aspect-[2/3] rounded-lg overflow-hidden ring-1 ring-white/10 transition-all duration-500 group-hover:ring-white/20"
                        style={{
                          boxShadow:
                            '0 8px 32px oklch(0 0 0 / 0.5), 0 2px 8px oklch(0 0 0 / 0.35)',
                        }}
                      >
                        {posterUrl ? (
                          <img
                            src={posterUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
        <motion.div
          className="relative z-10 px-6 pt-4 pb-6 md:px-8 md:pt-5 md:pb-8"
          variants={shouldReduceMotion ? undefined : contentVariants}
          initial={shouldReduceMotion ? undefined : 'initial'}
          animate={shouldReduceMotion ? undefined : 'animate'}
        >
          <div className="flex items-start justify-between gap-4">
            <h2
              className="flex-1 font-bold text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] uppercase"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '0.03em',
                color: 'var(--foreground)',
              }}
            >
              {tierlist.title || 'Untitled'}
            </h2>
            <div className="flex items-center gap-2 pt-2 shrink-0">
              {isOwner && (
                <DeleteButton tierlistId={tierlist.id} userId={userId} />
              )}
              <div className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-300">
                <span>Open</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
          {dateRange && (
            <p className="text-xs tracking-widest uppercase mt-2 font-medium opacity-60">
              {dateRange}
            </p>
          )}
          <div className="flex items-center gap-5 mt-5">
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl md:text-3xl font-bold leading-none"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: 'var(--foreground)',
                }}
              >
                {tierlist.movieCount}
              </span>
              <span className="text-xs uppercase tracking-wider font-medium opacity-60">
                films
              </span>
            </div>

            <div
              className="w-px h-6"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, oklch(from var(--foreground) l c h / 0.15), transparent)',
              }}
            />

            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary">
                <Layers className="w-4 h-4" />
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                {tierlist.tierCount}
              </span>
              <span className="text-xs uppercase tracking-wider font-medium opacity-60">
                tiers
              </span>
            </div>
          </div>
          {tierlist.genres && tierlist.genres.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-2 mt-6"
              initial="initial"
              animate="animate"
            >
              {tierlist.genres.map((genre, i) => (
                <motion.span
                  key={genre}
                  custom={i}
                  variants={shouldReduceMotion ? undefined : tagVariants}
                  className="px-3 py-1.5 text-xs font-semibold tracking-wide rounded-md border transition-colors duration-200"
                  style={{
                    background: 'oklch(from var(--primary) l c h / 0.1)',
                    borderColor: 'oklch(from var(--primary) l c h / 0.2)',
                    color: 'var(--foreground)',
                  }}
                >
                  {genre}
                </motion.span>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.article>
    </Link>
  )
}

function formatTierlistDateRange(
  from: string | null,
  to: string | null,
): string | null {
  if (!from && !to) return null

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })

  if (from && to) return `${formatDate(from)} — ${formatDate(to)}`
  if (from) return `From ${formatDate(from)}`
  if (to) return `Until ${formatDate(to)}`
  return null
}
