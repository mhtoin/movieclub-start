import { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import { useDroppable } from '@dnd-kit/core'
import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'
import { memo } from 'react'
import TierItem from './tier-item'

interface TierContainerProps {
  id: string
  tier: TierWithMovies
  isOwner?: boolean
}

const getTierColors = (value: number) => {
  const numberValue = value <= 5 ? value : 'default'
  const colorSchemes: Record<string, { text: string }> = {
    '5': { text: 'text-emerald-500' },
    '4': { text: 'text-lime-500' },
    '3': { text: 'text-amber-500' },
    '2': { text: 'text-orange-500' },
    '1': { text: 'text-red-500' },
    '0': { text: 'text-violet-500' },
    default: { text: 'text-primary' },
  }

  return colorSchemes[numberValue] || { text: 'text-primary' }
}

function TierContainer({ id, tier, isOwner = true }: TierContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: !isOwner,
  })

  const colors = getTierColors(tier.value)

  return (
    <SortableContext
      id={id}
      items={tier.movies.map((movie) => movie.id)}
      strategy={horizontalListSortingStrategy}
    >
      <div
        key={id}
        className={`relative transition-all duration-200 ${
          isOver
            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            : ''
        }`}
        ref={setNodeRef}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`text-lg font-bold ${colors.text}`}>
              {tier.label}
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-muted flex-shrink-0">
            <span className="text-xs font-medium text-muted-foreground">
              {tier.movies.length}{' '}
              {tier.movies.length === 1 ? 'movie' : 'movies'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <div
            className={`flex flex-wrap gap-3 transition-all duration-200 ${
              tier.movies.length === 0
                ? 'min-h-[120px] items-center justify-center border-2 border-dashed border-border rounded-lg'
                : 'items-start content-start'
            }`}
          >
            {tier.movies.length === 0 ? (
              <p className="text-sm text-muted-foreground">Drop movies here</p>
            ) : (
              tier.movies.map((movie) => (
                <TierItem
                  key={movie.id}
                  movie={movie}
                  id={movie.id}
                  isOwner={isOwner}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </SortableContext>
  )
}

export default memo(TierContainer, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.tier.movies === nextProps.tier.movies
  )
})
