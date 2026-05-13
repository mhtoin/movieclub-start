import { useQuery } from '@tanstack/react-query'
import { Crown, Loader2, Trophy } from 'lucide-react'
import { useState } from 'react'
import type { FilterScope } from '@/components/dashboard/scope-toggle'
import type { DatePreset } from '@/lib/react-query/queries/dashboard'
import { DatePresetToggle } from '@/components/dashboard/date-preset-toggle'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { cn } from '@/lib/utils'

interface MoviesByUserSectionProps {
  userId: string
  scope: FilterScope
}

export function MoviesByUserSection({
  userId,
  scope,
}: MoviesByUserSectionProps) {
  const [preset, setPreset] = useState<DatePreset>('all-time')
  const { data, isFetching } = useQuery({
    ...dashboardQueries.moviesByUser(scope, userId, preset),
    placeholderData: (previousData) => previousData,
  })

  if (scope === 'mine') {
    return null
  }

  if (!data || data.moviesByUser.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-cinema tracking-wide">
                Club Standings
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                No movies watched in this period yet
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <DatePresetToggle value={preset} onChange={setPreset} />
          </div>
        </div>
      </div>
    )
  }

  const maxCount = data.moviesByUser[0]?.count || 1

  return (
    <div className="rounded-xl border border-border bg-card p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold font-cinema tracking-wide">
              Club Standings
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Movies watched by club members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <DatePresetToggle value={preset} onChange={setPreset} />
        </div>
      </div>

      <div
        className={cn(
          'space-y-1 transition-opacity duration-300',
          isFetching && 'opacity-60',
        )}
      >
        {data.moviesByUser.map((member, i) => {
          const isTop = i === 0
          const isRunnerUp = i === 1 || i === 2
          const percentage = maxCount > 0 ? (member.count / maxCount) * 100 : 0

          return (
            <div
              key={member.userName}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                isTop && 'bg-primary/5',
                !isTop && 'hover:bg-muted/40',
              )}
            >
              {/* Rank */}
              <div className="w-6 text-center flex-shrink-0">
                {isTop ? (
                  <Crown className="h-4 w-4 text-primary mx-auto" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div
                className={cn(
                  'rounded-full overflow-hidden bg-muted border border-border flex-shrink-0',
                  isTop ? 'h-11 w-11' : 'h-9 w-9',
                )}
              >
                {member.userImage ? (
                  <img
                    src={member.userImage}
                    alt={member.userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {member.userName[0]}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={cn(
                      'text-sm font-medium truncate',
                      isTop && 'text-primary',
                    )}
                  >
                    {member.userName}
                  </span>
                  <span className="text-xs font-semibold tabular-nums flex-shrink-0">
                    {member.count}{' '}
                    <span className="text-muted-foreground font-normal">
                      {member.count === 1 ? 'movie' : 'movies'}
                    </span>
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isTop
                        ? 'var(--primary)'
                        : isRunnerUp
                          ? `oklch(0.6 0.08 ${40 + i * 20})`
                          : `oklch(0.55 0.06 ${50 + i * 15})`,
                      transitionDelay: `${i * 50}ms`,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
