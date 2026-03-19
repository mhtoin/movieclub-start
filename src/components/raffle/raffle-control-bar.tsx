import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  CalendarDays,
  Dices,
  FilmIcon,
  UserCheck2,
  Users,
} from 'lucide-react'
import { useMemo } from 'react'

interface BlockersProps {
  watchDate: Date | undefined
  readyCount: number
  totalCount: number
  pendingSelectionsCount: number
}

interface Blocker {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

function RaffleBlockers({
  watchDate,
  readyCount,
  totalCount,
  pendingSelectionsCount,
}: BlockersProps) {
  const blockers: Blocker[] = []

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

  if (blockers.length === 0) return null

  return (
    <div
      className={cn(
        'absolute bottom-full left-1/2 -translate-x-1/2 mb-3',
        'animate-in fade-in slide-in-from-bottom-2 duration-300',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-warning/30',
          'bg-card/98 backdrop-blur-md shadow-2xl',
          'before:absolute before:-bottom-2 before:left-1/2 before:-translate-x-1/2',
          'before:border-8 before:border-transparent before:border-t-warning/30',
          'after:absolute after:-bottom-[10px] after:left-1/2 after:-translate-x-1/2',
          'after:border-[9px] after:border-transparent after:border-t-card/98',
        )}
      >
        <div className="px-4 py-3 max-w-[280px]">
          <div className="flex items-center gap-2 mb-2">
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

          <ul className="space-y-1.5">
            {blockers.map((blocker) => (
              <li key={blocker.id} className="flex items-start gap-2 text-xs">
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
  )
}

interface Props {
  watchDate: Date | undefined
  onDateSelect: (date: Date) => void
  dryRun: boolean
  onDryRunChange: (val: boolean) => void
  onStartRaffle: () => void
  canStart: boolean
  readyCount: number
  totalCount: number
  pendingSelectionsCount?: number
}

export function RaffleControlBar({
  watchDate,
  onDateSelect,
  dryRun,
  onDryRunChange,
  onStartRaffle,
  canStart,
  readyCount,
  totalCount,
  pendingSelectionsCount = 0,
}: Props) {
  const today = useMemo(() => new Date(), [])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="container mx-auto flex justify-center">
        <div className="relative flex flex-col items-center">
          <RaffleBlockers
            watchDate={watchDate}
            readyCount={readyCount}
            totalCount={totalCount}
            pendingSelectionsCount={pendingSelectionsCount}
          />

          <div className="inline-flex items-center gap-2 sm:gap-3 bg-card/95 backdrop-blur-md border border-border rounded-full px-3 sm:px-5 py-2.5 sm:py-3 shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-2">
              <DatePicker
                value={watchDate}
                onChange={onDateSelect}
                minDate={today}
                placeholder="Pick date"
                displayFormat="EEE, d MMM"
                className="rounded-full"
              />
            </div>

            <div className="w-px h-6 bg-border" />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="font-medium">
                <span className="text-foreground">{readyCount}</span>/
                {totalCount}
              </span>
              <span className="hidden sm:inline">ready</span>
            </div>

            <div className="w-px h-6 bg-border" />

            <Button
              variant="primary"
              size="sm"
              className="rounded-full gap-2 px-5 shadow-lg shadow-primary/25"
              onClick={onStartRaffle}
              disabled={!canStart}
            >
              <Dices className="w-4 h-4" />
              <span className="font-medium">Start Raffle</span>
            </Button>

            <div className="w-px h-6 bg-border" />

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Switch
                checked={dryRun}
                onCheckedChange={onDryRunChange}
                size="sm"
              />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Test
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
