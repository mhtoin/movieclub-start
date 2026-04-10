import { RaffleBlockersToast } from '@/components/raffle/raffle-blockers-toast'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Switch } from '@/components/ui/switch'
import { Dices, Users } from 'lucide-react'
import { useMemo } from 'react'

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
          <RaffleBlockersToast
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
