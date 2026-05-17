import { CheckCheck, Dices, Loader, Users } from 'lucide-react'
import { useMemo } from 'react'
import { RaffleBlockersToast } from '@/components/raffle/raffle-blockers-toast'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Switch } from '@/components/ui/switch'

interface Props {
  watchDate: Date | undefined
  onDateSelect: (date: Date) => void
  dryRun: boolean
  onDryRunChange: (val: boolean) => void
  onStartRaffle: () => void
  onSetAllReady?: () => void
  canStart: boolean
  readyCount: number
  totalCount: number
  hasUnreadyParticipants?: boolean
  isSettingAllReady?: boolean
  pendingUsers?: Array<{ name: string }>
}

export function RaffleControlBar({
  watchDate,
  onDateSelect,
  dryRun,
  onDryRunChange,
  onStartRaffle,
  onSetAllReady,
  canStart,
  readyCount,
  totalCount,
  hasUnreadyParticipants = false,
  isSettingAllReady = false,
  pendingUsers = [],
}: Props) {
  const today = useMemo(() => new Date(), [])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none md:z-50">
      {/* Desktop: full control bar at bottom */}
      <div className="hidden md:block px-4 pb-4">
        <div className="container mx-auto flex justify-center">
          <div className="relative flex flex-col items-center">
            <RaffleBlockersToast
              watchDate={watchDate}
              readyCount={readyCount}
              totalCount={totalCount}
              pendingUsers={pendingUsers}
            />

            <div className="inline-flex items-center gap-3 bg-card/95 backdrop-blur-md border border-border rounded-full px-5 py-3 shadow-2xl pointer-events-auto">
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
                <Users className="size-4" />
                <span className="font-medium">
                  <span className="text-foreground">{readyCount}</span>/
                  {totalCount}
                </span>
                <span>ready</span>
              </div>

              {hasUnreadyParticipants && (
                <>
                  <div className="w-px h-6 bg-border" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2 px-4"
                    onClick={onSetAllReady}
                    disabled={isSettingAllReady}
                  >
                    {isSettingAllReady ? (
                      <Loader className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCheck className="size-3.5" />
                    )}
                    <span className="font-medium text-xs">Mark all ready</span>
                  </Button>
                </>
              )}

              <div className="w-px h-6 bg-border" />

              <Button
                variant="primary"
                size="sm"
                className="rounded-full gap-2 px-5 shadow-lg shadow-primary/25"
                onClick={onStartRaffle}
                disabled={!canStart}
              >
                <Dices className="size-4" />
                <span className="font-medium">Start Raffle</span>
              </Button>

              {import.meta.env.DEV && (
                <>
                  <div className="w-px h-6 bg-border" />
                  <label
                    htmlFor="raffle-dry-run-desktop"
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <Switch
                      id="raffle-dry-run-desktop"
                      checked={dryRun}
                      onCheckedChange={onDryRunChange}
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground">Test</span>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: simplified bar above bottom nav */}
      <div className="md:hidden px-3 pb-3 pt-1">
        <div className="flex items-center gap-2 bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl px-3 py-2.5 shadow-xl pointer-events-auto">
          <DatePicker
            value={watchDate}
            onChange={onDateSelect}
            minDate={today}
            placeholder="Date"
            displayFormat="d MMM"
            className="rounded-full text-xs min-w-[90px]"
          />

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
            <Users className="size-3.5" />
            <span className="font-medium text-foreground">{readyCount}</span>
            <span className="text-[10px]">/{totalCount}</span>
          </div>

          <div className="flex-1" />

          {hasUnreadyParticipants && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1 px-2.5 py-1.5 text-[10px] flex-shrink-0"
              onClick={onSetAllReady}
              disabled={isSettingAllReady}
            >
              {isSettingAllReady ? (
                <Loader className="size-3 animate-spin" />
              ) : (
                <CheckCheck className="size-3" />
              )}
              <span className="font-medium">Ready</span>
            </Button>
          )}

          {import.meta.env.DEV && (
            <label
              htmlFor="raffle-dry-run-mobile"
              className="flex items-center gap-1.5 cursor-pointer select-none flex-shrink-0"
            >
              <Switch
                id="raffle-dry-run-mobile"
                checked={dryRun}
                onCheckedChange={onDryRunChange}
                size="sm"
              />
              <span className="text-[10px] text-muted-foreground">Test</span>
            </label>
          )}

          <Button
            variant="primary"
            size="sm"
            className="rounded-full gap-1.5 px-3 py-1.5 text-xs flex-shrink-0"
            onClick={onStartRaffle}
            disabled={!canStart}
          >
            <Dices className="size-3.5" />
            <span className="font-medium">Raffle</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
