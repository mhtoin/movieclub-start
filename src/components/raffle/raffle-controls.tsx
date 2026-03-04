import { Switch } from '@/components/ui/switch'
import { useUpdateUserShortlistStatusMutation } from '@/lib/react-query/mutations/shortlist'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Dices,
  User2,
  XCircle,
} from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Button } from '../ui/button'
import { DatePicker } from '../ui/date-picker'

interface Props {
  watchDate: Date | undefined
  onDateSelect: (date: Date) => void
  dryRun: boolean
  onDryRunChange: (val: boolean) => void
  onStartRaffle: () => void
}

export function RaffleControls({
  watchDate,
  onDateSelect,
  dryRun,
  onDryRunChange,
  onStartRaffle,
}: Props) {
  const { data: shortlists } = useSuspenseQuery(shortlistQueries.all())
  const updateStatus = useUpdateUserShortlistStatusMutation()

  const participating = useMemo(
    () => shortlists.filter((s) => s.participating),
    [shortlists],
  )
  const readyAndParticipating = useMemo(
    () => shortlists.filter((s) => s.isReady && s.participating),
    [shortlists],
  )
  const canStart = useMemo(
    () =>
      !!watchDate &&
      readyAndParticipating.length === participating?.length &&
      participating.length > 0,
    [watchDate, readyAndParticipating.length],
  )
  const today = useMemo(() => new Date(), [])

  const handleToggleReady = useCallback(
    (userId: string, current: boolean) => {
      updateStatus.mutate({ userId, isReady: !current })
    },
    [updateStatus],
  )

  const handleToggleParticipating = useCallback(
    (userId: string, current: boolean) => {
      updateStatus.mutate({ userId, participating: !current })
    },
    [updateStatus],
  )

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Watchdate</h3>
        </div>
        <DatePicker
          value={watchDate}
          onChange={onDateSelect}
          minDate={today}
          placeholder="Select watchdate"
          displayFormat="EEEE, d MMMM yyyy"
        />
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <User2 className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Participants
            </h3>
          </div>
          <span className="text-xs text-muted-foreground bg-muted/50 rounded-full px-2.5 py-1">
            {readyAndParticipating.length} / {participating.length} ready
          </span>
        </div>

        <div className="h-1 bg-muted/50">
          <div
            className="h-full bg-success transition-all duration-500 rounded-full"
            style={{
              width:
                participating.length > 0
                  ? `${(readyAndParticipating.length / participating.length) * 100}%`
                  : '0%',
            }}
          />
        </div>

        <div className="divide-y divide-border">
          {shortlists.map((shortlist) => {
            return (
              <div
                key={shortlist.id}
                className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${!shortlist.participating ? 'opacity-50' : ''}`}
              >
                {shortlist.user.image ? (
                  <img
                    src={shortlist.user.image}
                    alt={shortlist.user.name}
                    className={`w-8 h-8 rounded-full border-2 flex-shrink-0 ${!shortlist.participating ? 'grayscale' : ''}`}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {shortlist.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${!shortlist.participating ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  >
                    {shortlist.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {shortlist.movies.length} movie
                    {shortlist.movies.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    handleToggleParticipating(
                      shortlist.user.id,
                      shortlist.participating,
                    )
                  }
                  className={`rounded-full gap-1 text-[11px] font-medium ${
                    shortlist.participating
                      ? 'text-foreground bg-muted/60 hover:bg-muted'
                      : 'text-muted-foreground/60 bg-muted/30 hover:bg-muted/50'
                  }`}
                  title={
                    shortlist.participating
                      ? 'Click to mark as sitting out'
                      : 'Click to include'
                  }
                >
                  {shortlist.participating ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-success" />
                      In
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-destructive" />
                      Out
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    handleToggleReady(shortlist.user.id, shortlist.isReady)
                  }
                  disabled={!shortlist.participating}
                  className={`rounded-full gap-1 text-[11px] font-medium ${
                    shortlist.isReady
                      ? 'text-success bg-success/10 border border-success/30 hover:bg-success/20'
                      : 'text-muted-foreground bg-muted/50 hover:bg-muted'
                  }`}
                  title={
                    shortlist.isReady
                      ? 'Click to unmark ready'
                      : 'Click to mark ready'
                  }
                >
                  {shortlist.isReady ? 'Ready' : 'Not ready'}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
      {!canStart && (
        <div className="flex items-start gap-2.5 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            {!watchDate
              ? 'Set a date to continue.'
              : 'Participants must be ready.'}
          </span>
        </div>
      )}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2.5 cursor-pointer select-none flex-1">
          <Switch checked={dryRun} onCheckedChange={onDryRunChange} size="sm" />
          <span className="text-sm text-muted-foreground">
            Dry run
            <span className="text-xs ml-1 text-muted-foreground/60">
              (don't save result)
            </span>
          </span>
        </label>

        <Button
          variant="primary"
          size="lg"
          className="rounded-full gap-2 px-8 shadow-lg shadow-primary/25"
          onClick={onStartRaffle}
          disabled={!canStart}
        >
          <Dices className="w-5 h-5" />
          Start Raffle
        </Button>
      </div>
    </div>
  )
}
