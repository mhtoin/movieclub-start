import type { DirectorActorCollab } from '@/lib/react-query/queries/dashboard'
import { getImageUrl } from '@/lib/tmdb-api'
import { Users } from 'lucide-react'

interface CollabsListProps {
  data: DirectorActorCollab[]
  emptyMessage?: string
}

export function CollabsList({
  data,
  emptyMessage = 'No collaborations yet',
}: CollabsListProps) {
  const maxCount = data[0]?.count || 1

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((collab, i) => (
        <div
          key={`${collab.director}-${collab.actor}`}
          className="flex items-center gap-3"
        >
          <span className="text-xs text-muted-foreground w-5 flex-shrink-0">
            {i + 1}
          </span>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative">
              {collab.directorProfile ? (
                <img
                  src={getImageUrl(collab.directorProfile, 'w185') || ''}
                  alt={collab.director}
                  className="h-9 w-9 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-muted border border-background flex items-center justify-center">
                <span className="text-[8px] font-bold">→</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {collab.actorProfile ? (
                <img
                  src={getImageUrl(collab.actorProfile, 'w185') || ''}
                  alt={collab.actor}
                  className="h-9 w-9 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{collab.director}</p>
              <p className="text-xs text-muted-foreground truncate">
                {collab.actor}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/70 transition-all"
                style={{
                  width: `${(collab.count / maxCount) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground w-6 text-right">
              {collab.count}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
