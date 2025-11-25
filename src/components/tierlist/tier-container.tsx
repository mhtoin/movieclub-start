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

export default function TierContainer({ id, tier }: TierContainerProps) {
  const { setNodeRef } = useDroppable({
    id,
  })
  return (
    <SortableContext
      id={id}
      items={tier.movies.map((movie) => movie.id)}
      strategy={horizontalListSortingStrategy}
    >
      <div key={id} className="border rounded-lg p-4" ref={setNodeRef}>
        <h2 className="text-xl font-semibold mb-2">{tier.label}</h2>
        <div className="flex flex-wrap gap-4 transition-colors min-h-[100px]">
          {tier.movies.map((movie) => (
            <TierItem key={movie.id} movie={movie} id={movie.id} />
          ))}
        </div>
      </div>
    </SortableContext>
  )
}
