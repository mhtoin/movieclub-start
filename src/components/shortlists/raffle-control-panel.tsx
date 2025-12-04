import { Calendar, Dices, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
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
