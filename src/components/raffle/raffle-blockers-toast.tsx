import {
  AlertTriangle,
  CalendarDays,
  FilmIcon,
  UserCheck2,
  Users,
  X,
} from 'lucide-react'
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from 'framer-motion'
import { useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  watchDate: Date | undefined
  readyCount: number
  totalCount: number
  pendingUsers: Array<{ name: string }>
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
  pendingUsers,
}: Props) {
  const prefersReducedMotion = useReducedMotion()
  const blockers = useMemo(() => {
    const result: Array<Blocker> = []

    if (!watchDate) {
      result.push({
        id: 'date',
        icon: CalendarDays,
        title: 'Pick a date',
        description: 'Select a watch date to proceed',
      })
    }

    if (totalCount === 0) {
      result.push({
        id: 'participants',
        icon: Users,
        title: 'No participants',
        description: 'Someone must join first',
      })
    }

    if (readyCount < totalCount && totalCount > 0) {
      const notReady = totalCount - readyCount
      result.push({
        id: 'ready',
        icon: UserCheck2,
        title: `${notReady} not ready`,
        description: 'Everyone must mark ready',
      })
    }

    if (pendingUsers.length > 0) {
      const names = pendingUsers.map((u) => u.name)
      const description =
        names.length === 1
          ? `${names[0]} must pick a film`
          : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} must pick a film`

      result.push({
        id: 'selection',
        icon: FilmIcon,
        title: 'Selection pending',
        description,
      })
    }

    return result
  }, [watchDate, totalCount, readyCount, pendingUsers])

  const blockersSignature = useMemo(
    () => blockers.map((blocker) => blocker.id).join('|'),
    [blockers],
  )

  const [dismissedSignature, setDismissedSignature] = useState<string | null>(
    null,
  )
  const isOpen = dismissedSignature !== blockersSignature

  return (
    <LazyMotion features={domAnimation}>
      <div className="absolute bottom-full right-0 mb-3 pointer-events-auto">
        <div className="relative flex items-end justify-end">
          <AnimatePresence initial={false}>
            {blockers.length > 0 && isOpen ? (
              <m.div
                initial={
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                }
                animate={
                  prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                }
                exit={
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                }
                transition={{
                  duration: prefersReducedMotion ? 0.12 : 0.3,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className={cn(
                  'absolute bottom-full left-1/2 mb-2 translate-x-2',
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
                        <div className="size-6 rounded-lg bg-warning/15 flex items-center justify-center">
                          <AlertTriangle
                            className="size-3.5 text-warning"
                            strokeWidth={2.5}
                          />
                        </div>
                        <span className="text-xs font-semibold text-warning uppercase tracking-wide">
                          Cannot start
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDismissedSignature(blockersSignature)}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                        aria-label="Dismiss blockers"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>

                    <ul className="space-y-1.5">
                      {blockers.map((blocker) => (
                        <li
                          key={blocker.id}
                          className="flex items-start gap-2 text-xs"
                        >
                          <div className="flex items-center justify-center size-4 rounded-sm bg-warning/10 mt-0.5 shrink-0">
                            <blocker.icon className="size-2.5 text-warning/80" />
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
              </m.div>
            ) : null}
          </AnimatePresence>

          {blockers.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setDismissedSignature((prev) =>
                  prev === blockersSignature ? null : blockersSignature,
                )
              }
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
          )}
        </div>
      </div>
    </LazyMotion>
  )
}
