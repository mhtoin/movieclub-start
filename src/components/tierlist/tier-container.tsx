import { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import { useDroppable } from '@dnd-kit/core'
import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react'
import { memo } from 'react'
import TierItem from './tier-item'

interface TierContainerProps {
  id: string
  tier: TierWithMovies
  isOwner?: boolean
}

const getTierColors = (value: number) => {
  const numberValue = value <= 5 ? value : 'default'
  const colorSchemes: Record<
    string,
    { accent: string; bg: string; text: string; glow: string }
  > = {
    '5': {
      accent: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-500',
      glow: 'shadow-emerald-500/20',
    },
    '4': {
      accent: 'from-lime-500 to-green-500',
      bg: 'bg-lime-500/5',
      text: 'text-lime-500',
      glow: 'shadow-lime-500/20',
    },
    '3': {
      accent: 'from-amber-400 to-yellow-500',
      bg: 'bg-amber-500/5',
      text: 'text-amber-500',
      glow: 'shadow-amber-500/20',
    },
    '2': {
      accent: 'from-orange-500 to-amber-600',
      bg: 'bg-orange-500/5',
      text: 'text-orange-500',
      glow: 'shadow-orange-500/20',
    },
    '1': {
      accent: 'from-red-500 to-rose-600',
      bg: 'bg-red-500/5',
      text: 'text-red-500',
      glow: 'shadow-red-500/20',
    },
    '0': {
      accent: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-500/5',
      text: 'text-violet-500',
      glow: 'shadow-violet-500/20',
    },
    default: {
      accent: 'from-slate-400 to-slate-500',
      bg: 'bg-slate-500/5',
      text: 'text-slate-400',
      glow: 'shadow-slate-500/20',
    },
  }

  return (
    colorSchemes[numberValue] || {
      accent: 'from-primary to-primary/80',
      bg: 'bg-primary/5',
      text: 'text-primary',
      glow: 'shadow-primary/20',
    }
  )
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
        className={`relative rounded-md overflow-hidden transition-all duration-300 ${
          isOver
            ? `ring-2 ring-offset-2 ring-offset-background ring-primary shadow-xl ${colors.glow}`
            : 'hover:shadow-lg'
        }`}
        ref={setNodeRef}
      >
        <div
          className={`absolute inset-0 ${colors.bg} transition-opacity duration-300 ${
            isOver ? 'opacity-100' : 'opacity-60'
          }`}
        />
        <div className="relative flex flex-col">
          <div className="relative">
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colors.accent}`}
            />
            <div
              className={`flex items-center justify-between gap-4 px-4 pl-5 py-3 border-b border-border/30 ${colors.bg}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-lg font-bold ${colors.text}`}>
                  {tier.label}
                </span>
              </div>
              <div className="px-3 py-1 rounded-full bg-background/60 border border-border/40 flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground">
                  {tier.movies.length}{' '}
                  {tier.movies.length === 1 ? 'movie' : 'movies'}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 pl-5">
            <div
              className={`flex flex-wrap gap-3 transition-all duration-300 ${
                tier.movies.length === 0
                  ? 'min-h-[160px] items-center justify-center'
                  : 'min-h-[120px] items-start content-start'
              }`}
            >
              {tier.movies.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 w-full">
                  <GripVertical className="w-8 h-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground/70">
                    Drop movies here
                  </p>
                </div>
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
