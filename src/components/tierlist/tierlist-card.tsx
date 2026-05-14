import { Link } from '@tanstack/react-router'
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion'
import { ChevronRight, Film, Layers } from 'lucide-react'
import { DeleteButton } from './delete-button'
import type { TierlistPreview } from '@/lib/react-query/queries/tierlists'
import { getImageUrl } from '@/lib/tmdb-api'

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function TierlistCard({
  tierlist,
  userId,
  isOwner,
  index = 0,
}: {
  tierlist: TierlistPreview
  userId: string
  isOwner: boolean
  index?: number
}) {
  const posterPaths = tierlist.posterPaths.slice(0, 4)
  const shouldReduceMotion = useReducedMotion()

  return (
    <LazyMotion features={domAnimation}>
      <Link
        to="/tierlist/$userId/$tierlistId"
        params={{ userId, tierlistId: tierlist.id }}
        className="group block"
      >
        <m.article
          initial={
            shouldReduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.97 }
          }
          animate={
            shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ delay: index * 0.08, duration: 0.5, ease: easeOut }}
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  y: -4,
                  rotate: -0.3,
                  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                }
          }
          whileTap={
            shouldReduceMotion
              ? undefined
              : { scale: 0.97, transition: { duration: 0.15 } }
          }
          layout
          className="ticket-card relative overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-stretch">
            <div className="shrink-0 w-[88px] p-3 flex items-center justify-center bg-muted/30">
              {posterPaths.length > 0 ? (
                <div className="flex gap-0.5 h-[72px] w-full rounded overflow-hidden ring-1 ring-black/5">
                  {posterPaths.map((path) => {
                    const posterUrl = getImageUrl(path, 'w92')
                    return (
                      <div key={path} className="flex-1 overflow-hidden">
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
                    )
                  })}
                </div>
              ) : (
                <div className="w-full h-[72px] rounded bg-muted/60 flex items-center justify-center">
                  <Film className="size-5 text-muted-foreground/30" />
                </div>
              )}
            </div>

            <div className="w-px self-stretch border-l border-dashed border-border/50 my-3" />

            <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                  {tierlist.title || 'Untitled'}
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  {isOwner && (
                    <DeleteButton
                      tierlistId={tierlist.id}
                      userId={userId}
                      compact
                    />
                  )}
                  <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200" />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Layers className="size-3" />
                  {tierlist.tierCount}
                </span>
                <span className="flex items-center gap-1">
                  <Film className="size-3" />
                  {tierlist.movieCount}
                </span>
              </div>

              {tierlist.genres && tierlist.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {tierlist.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </m.article>
      </Link>
    </LazyMotion>
  )
}
