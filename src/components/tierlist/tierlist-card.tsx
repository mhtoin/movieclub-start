import type { TierlistPreview } from '@/lib/react-query/queries/tierlists'
import { getImageUrl } from '@/lib/tmdb-api'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Film, Layers } from 'lucide-react'
import { DeleteButton } from './delete-button'

export function TierlistCard({
  tierlist,
  userId,
  isOwner,
}: {
  tierlist: TierlistPreview
  userId: string
  isOwner: boolean
}) {
  const posterPaths = tierlist.posterPaths.slice(0, 4)

  return (
    <Link
      to="/tierlist/$userId/$tierlistId"
      params={{ userId, tierlistId: tierlist.id }}
      className="group block"
    >
      <article className="relative rounded-xl overflow-hidden border border-border/50 bg-card p-4 hover:border-border transition-colors">
        <div className="flex gap-4">
          {posterPaths.length > 0 && (
            <div className="flex gap-0.5 h-24 w-24 shrink-0 rounded-lg overflow-hidden bg-muted">
              {posterPaths.map((path, idx) => {
                const posterUrl = getImageUrl(path, 'w92')
                return (
                  <div key={idx} className="flex-1 overflow-hidden">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {tierlist.title || 'Untitled'}
            </h3>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {tierlist.tierCount}
              </span>
              <span className="flex items-center gap-1">
                <Film className="w-3 h-3" />
                {tierlist.movieCount}
              </span>
            </div>

            {tierlist.genres && tierlist.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tierlist.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            {isOwner && (
              <DeleteButton tierlistId={tierlist.id} userId={userId} compact />
            )}
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </article>
    </Link>
  )
}
