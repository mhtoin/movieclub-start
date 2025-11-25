import DragOverlayPortal from '@/components/tierlist/drag-overlay-portal'
import TierContainer from '@/components/tierlist/tier-container'
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
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
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
    console.log({ event })
    setActiveMovieId(active.id)
  }

  const handleDragOver = (event: any) => {
    const { active, over, draggingRect } = event
    const { id } = active
    const { id: overId } = over

    console.log({ active, over, draggingRect, id, overId })
  }

  function handleDragEnd(event: any) {
    const { active, over } = event
    const { movie } = active.data.current ?? {}
    const { movie: overMovie } = over?.data?.current ?? {}

    if (!movie || !overMovie) {
      setActiveMovieId(null)
      return
    }

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
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-8">
          {tierlist.tiers.map((tier) => (
            <TierContainer key={tier.id} id={tier.id} tier={tier} />
          ))}
          <DragOverlayPortal />
        </div>
      </DndContext>
    </div>
  )
}
