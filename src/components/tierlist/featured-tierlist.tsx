import type { TierlistPreview } from '@/lib/react-query/queries/tierlists'
import { getImageUrl } from '@/lib/tmdb-api'
import { Link } from '@tanstack/react-router'
import { Calendar, ChevronRight, Film, Layers } from 'lucide-react'
import { DeleteButton } from './delete-button'

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

  return (
    <Link
      to="/tierlist/$userId/$tierlistId"
      params={{ userId, tierlistId: tierlist.id }}
      className="group block"
    >
      <article className="relative rounded-2xl overflow-hidden border border-border/50 bg-card">
        {posterPaths.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 h-48 md:h-64">
            {posterPaths.map((path, idx) => {
              const posterUrl = getImageUrl(path, 'w342')
              return (
                <div
                  key={idx}
                  className="aspect-[2/3] overflow-hidden bg-muted"
                >
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
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground my-2">
                {tierlist.watchDateFrom && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(tierlist.watchDateFrom).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        year: 'numeric',
                      },
                    )}
                  </span>
                )}
                {tierlist.watchDateTo && (
                  <>
                    <span>—</span>
                    <span>
                      {new Date(tierlist.watchDateTo).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          year: 'numeric',
                        },
                      )}
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                {tierlist.title || 'Untitled'}
              </h2>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  {tierlist.tierCount} tiers
                </span>
                <span className="flex items-center gap-1.5">
                  <Film className="w-4 h-4" />
                  {tierlist.movieCount} movies
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <DeleteButton tierlistId={tierlist.id} userId={userId} />
              )}
              <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {tierlist.genres && tierlist.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tierlist.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
