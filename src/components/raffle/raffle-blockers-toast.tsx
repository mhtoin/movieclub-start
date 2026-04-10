import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  CalendarDays,
  FilmIcon,
  UserCheck2,
  Users,
  X,
} from 'lucide-react'
import { type ComponentType, useEffect, useMemo, useState } from 'react'

interface Props {
  watchDate: Date | undefined
  readyCount: number
  totalCount: number
  pendingSelectionsCount: number
}

interface Blocker {
  id: string
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

export function RaffleBlockersToast({
  watchDate,
  readyCount,
  totalCount,
  pendingSelectionsCount,
}: Props) {
  const [isOpen, setIsOpen] = useState(true)
  const blockers: Array<Blocker> = []

  if (!watchDate) {
    blockers.push({
      id: 'date',
      icon: CalendarDays,
      title: 'Pick a date',
      description: 'Select a watch date to proceed',
    })
  }

  if (totalCount === 0) {
    blockers.push({
      id: 'participants',
      icon: Users,
      title: 'No participants',
      description: 'Someone must join first',
    })
  }

  if (readyCount < totalCount && totalCount > 0) {
    const notReady = totalCount - readyCount
    blockers.push({
      id: 'ready',
      icon: UserCheck2,
      title: `${notReady} not ready`,
      description: 'Everyone must mark ready',
    })
  }

  if (pendingSelectionsCount > 0) {
    blockers.push({
      id: 'selection',
      icon: FilmIcon,
      title: 'Selection pending',
      description: 'Someone must pick a film',
    })
  }

  const blockersSignature = useMemo(
    () => blockers.map((blocker) => blocker.id).join('|'),
    [blockers],
  )

  useEffect(() => {
    if (blockers.length > 0) {
      setIsOpen(true)
    }
  }, [blockersSignature])

  if (blockers.length === 0) return null

  return (
    <div className="absolute bottom-full right-0 mb-3 pointer-events-auto">
      <div className="relative flex items-end justify-end">
        {isOpen ? (
          <div
            className={cn(
              'absolute bottom-full left-1/2 mb-2 translate-x-2',
              'animate-in fade-in slide-in-from-bottom-2 duration-300',
            )}
          >
            <div
              className={cn(
                'relative overflow-visible rounded-xl border border-warning/30',
                'bg-card/98 backdrop-blur-md shadow-2xl',
                'before:absolute before:-bottom-2 before:left-3',
                'before:border-8 before:border-transparent before:border-t-warning/30',
                'after:absolute after:-bottom-[10px] after:left-[10px]',
                'after:border-[9px] after:border-transparent after:border-t-card/98',
              )}
            >
              <div className="px-4 py-3 w-80 max-w-[calc(100vw-2rem)] sm:w-[22rem]">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-warning/15 flex items-center justify-center">
                      <AlertTriangle
                        className="w-3.5 h-3.5 text-warning"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-xs font-semibold text-warning uppercase tracking-wide">
                      Cannot start
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                    aria-label="Dismiss blockers"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ul className="space-y-1.5">
                  {blockers.map((blocker) => (
                    <li
                      key={blocker.id}
                      className="flex items-start gap-2 text-xs"
                    >
                      <div className="flex items-center justify-center w-4 h-4 rounded-sm bg-warning/10 mt-0.5 shrink-0">
                        <blocker.icon className="w-2.5 h-2.5 text-warning/80" />
                      </div>
                      <span className="text-muted-foreground">
                        <span className="text-foreground/90 font-medium">
                          {blocker.title}
                        </span>
                        {' — '}
                        {blocker.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-full border border-warning/40',
            'bg-card/95 text-warning shadow-lg shadow-warning/15',
            'transition-colors hover:bg-warning/10',
          )}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Hide blockers' : 'Show blockers'}
        >
          <AlertTriangle className="h-4 w-4" strokeWidth={2.3} />
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-warning text-[10px] leading-none text-warning-foreground font-semibold flex items-center justify-center">
            {blockers.length}
          </span>
        </button>
      </div>
    </div>
  )
}
