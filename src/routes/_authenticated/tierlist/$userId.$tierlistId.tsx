import DragOverlayPortal from '@/components/tierlist/drag-overlay-portal'
import DroppableTier from '@/components/tierlist/droppable-tier'
import Sortable from '@/components/tierlist/sortable'
import TierItem from '@/components/tierlist/tier-item'
import {
  electricMoviesOnTiersCollection,
  electricTierCollection,
  electricTierlistCollection,
  useTierlistLiveQuery,
} from '@/lib/react-query/queries/tierlists'
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute(
  '/_authenticated/tierlist/$userId/$tierlistId',
)({
  component: RouteComponent,
  loader: async ({ params }) => {
    await Promise.all([
      electricTierlistCollection.preload(),
      electricMoviesOnTiersCollection.preload(),
      electricTierCollection.preload(),
    ])
  },
  ssr: false,
})

function RouteComponent() {
  return <TierlistContent />
}

function TierlistContent() {
  const { userId, tierlistId } = Route.useParams()
  const [activeMovieId, setActiveMovieId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const tierlist = useTierlistLiveQuery(userId, tierlistId)

  function handleDragStart(event: any) {
    const { active } = event
    setActiveMovieId(active.id)
  }

  function handleDragEnd(event: any) {
    const { active, over } = event
    const { movie } = active.data.current ?? {}
    const { movie: overMovie } = over?.data?.current ?? {}

    const newTierPosition = overMovie.position
    const oldTierPosition = movie.position

    console.log({ movie, overMovie })

    electricMoviesOnTiersCollection.update(movie.movieOnTierId, (draft) => {
      console.log({ draft })
      draft.position = newTierPosition
    })

    electricMoviesOnTiersCollection.update(overMovie.movieOnTierId, (draft) => {
      console.log({ draft })
      draft.position = oldTierPosition
    })

    setActiveMovieId(null)
  }

  if (!tierlist) {
    return <p className="text-muted-foreground">Tierlist not found.</p>
  }

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">{tierlist.title}</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-8">
          <SortableContext
            id="tiers"
            items={tierlist.tiers.map((tier) => tier.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tierlist.tiers.map((tier) => (
              <SortableContext
                id={`${tier.id}`}
                items={tier.movies.map((m) => m.id)}
                strategy={horizontalListSortingStrategy}
              >
                <Sortable id={`${tier.id}`}>
                  <DroppableTier key={tier.id} tier={tier}>
                    {tier.movies.map((movie, index) => (
                      <Sortable key={movie.id} id={movie.id} data={{ movie }}>
                        <TierItem key={movie.id} movie={movie} />
                      </Sortable>
                    ))}
                  </DroppableTier>
                </Sortable>
              </SortableContext>
            ))}
          </SortableContext>
          <DragOverlayPortal />
        </div>
      </DndContext>
    </div>
  )
}
