import { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import { useDroppable } from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { memo, useState } from 'react'
import TierItem from './tier-item'

interface StickyUnrankedTierProps {
  tier: TierWithMovies
}

function StickyUnrankedTier({ tier }: StickyUnrankedTierProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { setNodeRef, isOver } = useDroppable({
    id: tier.id,
  })

  const movieCount = tier.movies.length

  return (
    <>
      <div
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-stretch transition-all duration-300 ease-in-out ${
          isExpanded ? 'translate-x-0' : 'translate-x-[calc(100%-3rem)]'
        }`}
      >
        {/* Toggle button - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex flex-col items-center justify-center gap-2 px-2 py-4 rounded-l-xl border-y-2 border-l-2 transition-all duration-200 ${
            isOver
              ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20'
              : 'bg-background/95 border-border/50 hover:bg-muted/80 hover:border-primary/30'
          } backdrop-blur-md`}
        >
          {isExpanded ? (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          )}
          <div className="flex flex-col items-center gap-1">
            <Inbox className="w-5 h-5 text-muted-foreground" />
            {movieCount > 0 && (
              <span className="flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                {movieCount}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-medium [writing-mode:vertical-rl] rotate-180">
            Unranked
          </span>
        </button>
        <div
          className={`w-72 max-h-[70vh] flex flex-col rounded-l-xl border-y-2 border-l-2 transition-all duration-200 ${
            isOver
              ? 'bg-primary/10 border-primary shadow-xl shadow-primary/20'
              : 'bg-background/95 border-border/50 shadow-2xl'
          } backdrop-blur-md`}
        >
          <div className="px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-sm font-bold text-muted-foreground">
                  ?
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">Unranked</h3>
                <p className="text-xs text-muted-foreground">
                  {movieCount} {movieCount === 1 ? 'movie' : 'movies'}
                </p>
              </div>
            </div>
          </div>
          <SortableContext
            id={tier.id}
            items={tier.movies.map((movie) => movie.id)}
            strategy={rectSortingStrategy}
          >
            <div
              ref={setNodeRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-3"
            >
              {movieCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">All ranked!</p>
                  <p className="text-xs text-muted-foreground/70">
                    Drop movies here to unrank them
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {tier.movies.map((movie) => (
                    <div key={movie.id} className="aspect-[2/3]">
                      <TierItem movie={movie} id={movie.id} compact />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-200 ${
          isOver
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-6 py-3 rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 backdrop-blur-sm">
          <span className="text-sm font-medium">Drop to unrank</span>
        </div>
      </div>
    </>
  )
}

export default memo(StickyUnrankedTier, (prevProps, nextProps) => {
  return prevProps.tier.movies === nextProps.tier.movies
})
