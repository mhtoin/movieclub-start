import { useUpdateUserShortlistStatusMutation } from '@/lib/react-query/mutations/shortlist'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Calendar, Dices, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import {
  PopoverArrow,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from '../ui/popover'
import { Switch } from '../ui/switch'

interface RaffleControlPanelProps {
  onStartRaffle: () => void
  onClose: () => void
  watchDate?: Date
  onDateSelect: (date: Date) => void
  dryRun: boolean
  onDryRunChange: (value: boolean) => void
  isSpinning: boolean
  hasWinner: boolean
}

export function RaffleControlPanel({
  onStartRaffle,
  onClose,
  watchDate,
  onDateSelect,
  dryRun,
  onDryRunChange,
  isSpinning,
  hasWinner,
}: RaffleControlPanelProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const { data: shortlists } = useSuspenseQuery(shortlistQueries.all())
  const updateStatusMutation = useUpdateUserShortlistStatusMutation()

  const handleToggleReady = (userId: string, currentValue: boolean) => {
    updateStatusMutation.mutate({ userId, isReady: !currentValue })
  }

  const handleToggleParticipating = (userId: string, currentValue: boolean) => {
    updateStatusMutation.mutate({ userId, participating: !currentValue })
  }

  return (
    <div className="flex items-center gap-3 bg-card/95 backdrop-blur-md border border-border rounded-full px-4 py-3 shadow-2xl">
      <div className="relative">
        <Button
          onClick={() => setShowDatePicker(!showDatePicker)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 rounded-full px-3"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {watchDate
              ? watchDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Pick date'}
          </span>
        </Button>
        {showDatePicker && (
          <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-lg p-2 shadow-lg">
            <input
              type="date"
              onChange={(e) => {
                const date = new Date(e.target.value)
                onDateSelect(date)
                setShowDatePicker(false)
              }}
              value={watchDate ? watchDate.toISOString().split('T')[0] : ''}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-border" />

      <PopoverRoot>
        <PopoverTrigger>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 rounded-full px-3"
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Users</span>
          </Button>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverPositioner side="top" align="center" sideOffset={30}>
            <PopoverPopup size="auto">
              <PopoverArrow />
              <div className="flex flex-col gap-3 min-w-[280px]">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                  Manage Participants
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {shortlists.map((shortlist) => (
                    <div
                      key={shortlist.user.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {shortlist.user.image && (
                          <img
                            src={shortlist.user.image}
                            alt={shortlist.user.name.charAt(0)}
                            className="w-6 h-6 rounded-full flex-shrink-0 border border-border flex items-center justify-center bg-background"
                          />
                        )}
                        <span className="text-sm font-medium truncate">
                          {shortlist.user.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={() =>
                            handleToggleReady(
                              shortlist.user.id,
                              shortlist.isReady,
                            )
                          }
                          variant="ghost"
                          size="sm"
                          className={`px-2 py-1 text-xs h-auto ${
                            shortlist.isReady
                              ? 'bg-success/30 text-success-foreground shadow-sm shadow-success/20 hover:bg-success/40'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                          title="Toggle ready status"
                        >
                          {shortlist.isReady ? 'Ready' : 'Not Ready'}
                        </Button>
                        <Button
                          onClick={() =>
                            handleToggleParticipating(
                              shortlist.user.id,
                              shortlist.participating,
                            )
                          }
                          variant="ghost"
                          size="sm"
                          className={`px-2 py-1 text-xs h-auto ${
                            shortlist.participating
                              ? 'bg-primary/20 text-primary hover:bg-primary/30'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                          title="Toggle participation"
                        >
                          {shortlist.participating ? 'Active' : 'Inactive'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverPopup>
          </PopoverPositioner>
        </PopoverPortal>
      </PopoverRoot>

      <div className="w-px h-6 bg-border" />

      <Button
        onClick={onStartRaffle}
        disabled={!watchDate || isSpinning || hasWinner}
        variant="primary"
        size="sm"
        className="flex items-center gap-2 rounded-full px-4"
      >
        <Dices className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} />
        <span className="font-medium">
          {hasWinner ? 'Winner!' : isSpinning ? 'Spinning...' : 'Start Raffle'}
        </span>
      </Button>

      <div className="w-px h-6 bg-border" />

      <div className="flex items-center gap-2">
        <Switch size="sm" checked={dryRun} onCheckedChange={onDryRunChange} />
        <span className="text-xs text-muted-foreground">Test</span>
      </div>

      <div className="w-px h-6 bg-border" />

      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  )
}
