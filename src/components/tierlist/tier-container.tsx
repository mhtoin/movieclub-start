import { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import { useDroppable } from '@dnd-kit/core'
import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'
import TierItem from './tier-item'

interface TierContainerProps {
  id: string
  tier: TierWithMovies
}

// Tier color scheme based on common tier list aesthetics
const getTierColors = (value: number) => {
  const numberValue = value <= 5 ? value : 'default'
  const colorSchemes: Record<
    string,
    { bg: string; border: string; label: string; badge: string }
  > = {
    '5': {
      bg: 'bg-gradient-to-r from-green-400/10 to-green-600/10',
      border: 'border-green-500/40',
      label: 'text-green-500',
      badge: 'bg-gradient-to-br from-green-400 to-green-600 text-green-950',
    },
    '4': {
      bg: 'bg-gradient-to-r from-lime-400/10 to-lime-600/10',
      border: 'border-lime-500/40',
      label: 'text-lime-500',
      badge: 'bg-gradient-to-br from-lime-400 to-lime-600 text-lime-950',
    },
    '3': {
      bg: 'bg-gradient-to-r from-yellow-400/10 to-yellow-600/10',
      border: 'border-yellow-500/40',
      label: 'text-yellow-500',
      badge: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950',
    },
    '2': {
      bg: 'bg-gradient-to-r from-orange-400/10 to-orange-600/10',
      border: 'border-orange-500/40',
      label: 'text-orange-500',
      badge: 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-950',
    },
    '1': {
      bg: 'bg-gradient-to-r from-red-400/10 to-red-600/10',
      border: 'border-red-500/40',
      label: 'text-red-500',
      badge: 'bg-gradient-to-br from-red-400 to-red-600 text-red-950',
    },
    '0': {
      bg: 'bg-gradient-to-r from-blue-400/10 to-blue-600/10',
      border: 'border-blue-500/40',
      label: 'text-blue-500',
      badge: 'bg-gradient-to-br from-blue-400 to-blue-600 text-blue-950',
    },
    default: {
      bg: 'bg-gradient-to-r from-slate-500/10 to-gray-500/10',
      border: 'border-slate-500/40',
      label: 'text-slate-500',
      badge: 'bg-gradient-to-br from-slate-400 to-gray-500 text-slate-950',
    },
  }

  return (
    colorSchemes[numberValue] || {
      bg: 'bg-gradient-to-r from-primary/10 to-secondary/10',
      border: 'border-primary/40',
      label: 'text-primary',
      badge:
        'bg-gradient-to-br from-primary to-secondary text-primary-foreground',
    }
  )
}

export default function TierContainer({ id, tier }: TierContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
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
        className={`relative border-2 rounded-xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl ${
          colors.border
        } ${isOver ? 'scale-[1.02] shadow-2xl' : ''}`}
        ref={setNodeRef}
      >
        <div
          className={`absolute inset-0 ${colors.bg} transition-opacity duration-300 ${isOver ? 'opacity-100' : 'opacity-50'}`}
        />
        <div className="relative flex gap-4">
          <div className="flex items-stretch">
            <div
              className={`w-24 p-4 flex items-center justify-center ${colors.badge} [writing-mode:vertical-lr] font-black text-3xl tracking-tight shrink-0 shadow-lg`}
            >
              {tier.label}
            </div>
          </div>
          <div className="flex-1 py-6 pr-6">
            <div
              className={`flex flex-wrap gap-4 transition-all duration-300 min-h-[180px] ${
                tier.movies.length === 0 ? 'items-center justify-center' : ''
              }`}
            >
              {tier.movies.length === 0 ? (
                <div className="text-muted-foreground text-sm italic">
                  Drop movies here to rank them in tier {tier.label}
                </div>
              ) : (
                tier.movies.map((movie) => (
                  <TierItem key={movie.id} movie={movie} id={movie.id} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </SortableContext>
  )
}
