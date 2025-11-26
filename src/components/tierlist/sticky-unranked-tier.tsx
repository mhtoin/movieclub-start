import { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import { useDroppable } from '@dnd-kit/core'
import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import TierItem from './tier-item'

interface StickyUnrankedTierProps {
  tier: TierWithMovies
}

export default function StickyUnrankedTier({ tier }: StickyUnrankedTierProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { setNodeRef, isOver } = useDroppable({
    id: tier.id,
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-primary/20 bg-background/95 backdrop-blur-sm shadow-2xl">
      <div className="max-w-full mx-auto">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground font-bold">
              ?
            </div>
            <div>
              <h3 className="text-lg font-semibold">Unranked Movies</h3>
              <p className="text-xs text-muted-foreground">
                {tier.movies.length}{' '}
                {tier.movies.length === 1 ? 'movie' : 'movies'}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </button>
        {isExpanded && (
          <SortableContext
            id={tier.id}
            items={tier.movies.map((movie) => movie.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div
              ref={setNodeRef}
              className={`px-6 pb-4 overflow-x-auto transition-all ${
                isOver ? 'bg-primary/10 border-t-2 border-primary' : ''
              }`}
            >
              <div className="flex gap-3 min-h-[140px] items-center">
                {tier.movies.length === 0 ? (
                  <div className="w-full text-center py-8 text-muted-foreground text-sm">
                    No unranked movies. All movies have been placed in tiers!
                  </div>
                ) : (
                  tier.movies.map((movie) => (
                    <div key={movie.id} className="flex-shrink-0">
                      <TierItem movie={movie} id={movie.id} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
}
