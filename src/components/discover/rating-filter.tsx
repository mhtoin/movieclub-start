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
}

export function RatingFilter({
  voteRange,
  onVoteRangeChange,
}: RatingFilterProps) {
  const [localVoteRange, setLocalVoteRange] = useState(voteRange)

  useEffect(() => {
    setLocalVoteRange(voteRange)
  }, [voteRange])

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        Rating: {localVoteRange[0].toFixed(1)} - {localVoteRange[1].toFixed(1)}
      </label>
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
    </div>
  )
}
