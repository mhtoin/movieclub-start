import {
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  SliderControl,
  SliderIndicator,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from '@/components/ui/slider'
import { useEffect, useState } from 'react'

interface RatingFilterProps {
  voteRange: [number, number]
  onVoteRangeChange: (range: [number, number]) => void
  variant?: 'default' | 'chip'
  chipContent?: React.ReactNode
}

export function RatingFilter({
  voteRange,
  onVoteRangeChange,
  variant = 'default',
  chipContent,
}: RatingFilterProps) {
  const [localVoteRange, setLocalVoteRange] = useState(voteRange)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setLocalVoteRange(voteRange)
  }, [voteRange])

  const sliderContent = (
    <SliderRoot
      value={localVoteRange}
      onValueChange={(value) => {
        const numValue = Array.isArray(value) ? value : [value]
        if (numValue.length >= 2) {
          setLocalVoteRange([numValue[0], numValue[1]])
        }
      }}
      onValueCommitted={(value) => {
        const numValue = Array.isArray(value) ? value : [value]
        if (numValue.length >= 2) {
          onVoteRangeChange([numValue[0], numValue[1]])
        }
      }}
      min={0}
      max={10}
      step={0.1}
      minStepsBetweenValues={1}
    >
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
        </SliderTrack>
        <SliderThumb
          index={0}
          getAriaValueText={(_, value) => `${value.toFixed(1)} start range`}
        />
        <SliderThumb
          index={1}
          getAriaValueText={(_, value) => `${value.toFixed(1)} end range`}
        />
      </SliderControl>
    </SliderRoot>
  )

  if (variant === 'chip') {
    return (
      <PopoverRoot open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="outline-none">{chipContent}</PopoverTrigger>
        <PopoverPortal>
          <PopoverPositioner side="bottom" align="start" sideOffset={8}>
            <PopoverPopup size="sm">
              <div className="w-56 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Rating Range
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {localVoteRange[0].toFixed(1)} -{' '}
                    {localVoteRange[1].toFixed(1)}
                  </span>
                </div>
                {sliderContent}
              </div>
            </PopoverPopup>
          </PopoverPositioner>
        </PopoverPortal>
      </PopoverRoot>
    )
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        Rating: {localVoteRange[0].toFixed(1)} - {localVoteRange[1].toFixed(1)}
      </label>
      {sliderContent}
    </div>
  )
}
