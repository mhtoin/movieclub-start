import DragOverlayPortal from '@/components/tierlist/drag-overlay-portal'
import StickyUnrankedTier from '@/components/tierlist/sticky-unranked-tier'
import TierContainer from '@/components/tierlist/tier-container'
import {
  electricMoviesOnTiersCollection,
  electricTierCollection,
  electricTierlistCollection,
  TierWithMovies,
  useTierlistLiveQuery,
} from '@/lib/react-query/queries/tierlists'
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const Route = createFileRoute(
  '/_authenticated/tierlist/$userId/$tierlistId',
)({
  component: RouteComponent,
  loader: async () => {
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  console.log('Rendering TierlistContent for', { userId, tierlistId })

  const tierlistFromDb = useTierlistLiveQuery(userId, tierlistId)

  /**
   * We need to use a local state copy of the tiers/movies during drag operations
   * For some reason it seems that moving items between tiers relies on the onDragOver
   * to update the state.
   * Since our state is the electric shape, we would need to update the collection
   * on every drag over to get the desired UX.
   * To avoid that, we keep a local copy of the tiers/movies that we update during
   * drag operations, and only sync back to the electric collection on drag end.
   */
  const [localTiers, setLocalTiers] = useState<TierWithMovies[] | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Track if we're waiting for our own update to sync back
  const pendingUpdateRef = useRef(false)

  // Use ref for localTiers to avoid stale closures in callbacks
  const localTiersRef = useRef(localTiers)
  localTiersRef.current = localTiers

  // Build a lookup map for O(1) container finding
  const containerMap = useMemo(() => {
    const map = new Map<string, string>()
    const tiers = localTiers ?? tierlistFromDb?.tiers
    if (!tiers) return map

    tiers.forEach((tier) => {
      map.set(tier.id, tier.id) // tier id -> tier id
      tier.movies.forEach((m) => map.set(m.id, tier.id)) // movie id -> tier id
    })
    return map
  }, [localTiers, tierlistFromDb?.tiers])

  const findContainer = useCallback(
    (id: string): string | null => containerMap.get(id) ?? null,
    [containerMap],
  )

  // Use local state when dragging, otherwise use the live query data
  const tierlist = useMemo(() => {
    if (!tierlistFromDb) return null
    return {
      ...tierlistFromDb,
      tiers: isDragging && localTiers ? localTiers : tierlistFromDb.tiers,
    }
  }, [tierlistFromDb, localTiers, isDragging])

  // Sync local state when DB data changes (and not currently dragging)
  useEffect(() => {
    if (tierlistFromDb && !isDragging) {
      // Skip if this is our own update coming back
      if (pendingUpdateRef.current) {
        pendingUpdateRef.current = false
        return
      }
      setLocalTiers(tierlistFromDb.tiers)
    }
  }, [tierlistFromDb, isDragging])

  function handleDragStart() {
    setIsDragging(true)
  }

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      const currentLocalTiers = localTiersRef.current
      if (!over || !currentLocalTiers) return

      const activeId = active.id as string
      const overId = over.id as string

      const activeContainer = findContainer(activeId)
      const overContainer = findContainer(overId)

      if (
        !activeContainer ||
        !overContainer ||
        activeContainer === overContainer
      ) {
        return
      }

      // Update local state only (no DB update during drag)
      setLocalTiers((prevTiers) => {
        if (!prevTiers) return prevTiers

        const activeTierIndex = prevTiers.findIndex(
          (t) => t.id === activeContainer,
        )
        const overTierIndex = prevTiers.findIndex((t) => t.id === overContainer)

        if (activeTierIndex === -1 || overTierIndex === -1) return prevTiers

        const activeTier = prevTiers[activeTierIndex]
        const overTier = prevTiers[overTierIndex]

        const activeMovieIndex = activeTier.movies.findIndex(
          (m) => m.id === activeId,
        )
        if (activeMovieIndex === -1) return prevTiers

        // Get the movie being moved (without mutating)
        const movedMovie = activeTier.movies[activeMovieIndex]

        // Calculate new index in target tier
        let newIndex: number
        if (overId === overContainer) {
          // Dropping on the container itself
          newIndex = overTier.movies.length
        } else {
          const overIndex = overTier.movies.findIndex((m) => m.id === overId)
          newIndex = overIndex >= 0 ? overIndex : overTier.movies.length
        }

        // Create new tiers array with the movie moved (immutably)
        const newTiers = prevTiers.map((tier, index) => {
          if (index === activeTierIndex) {
            return {
              ...tier,
              movies: tier.movies.filter((m) => m.id !== activeId),
            }
          }
          if (index === overTierIndex) {
            const newMovies = [...tier.movies.filter((m) => m.id !== activeId)]
            newMovies.splice(newIndex, 0, movedMovie)
            return {
              ...tier,
              movies: newMovies,
            }
          }
          return tier
        })

        return newTiers
      })
    },
    [findContainer],
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const currentLocalTiers = localTiersRef.current

    if (!over || !currentLocalTiers || !tierlistFromDb) {
      setIsDragging(false)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    const currentContainer = findContainer(activeId)
    const targetContainer = findContainer(overId)

    if (!currentContainer || !targetContainer) {
      setIsDragging(false)
      return
    }

    console.log({ active, over, currentContainer, targetContainer })

    // Compute the final tiers state (handle same-container reordering)
    let finalTiers = currentLocalTiers
    if (currentContainer === targetContainer) {
      const tier = currentLocalTiers.find((t) => t.id === currentContainer)
      if (tier) {
        const activeIndex = tier.movies.findIndex((m) => m.id === activeId)
        const overIndex = tier.movies.findIndex((m) => m.id === overId)

        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          activeIndex !== overIndex
        ) {
          // Reorder within the tier
          const reorderedMovies = arrayMove(tier.movies, activeIndex, overIndex)
          finalTiers = currentLocalTiers.map((t) =>
            t.id === currentContainer ? { ...t, movies: reorderedMovies } : t,
          )
          // Update local state for UI
          setLocalTiers(finalTiers)
        }
      }
    }

    // Build a map of original movie positions/tiers from DB
    const originalMovieData = new Map<
      string,
      { tierId: string; position: number; movieOnTierId: string }
    >()
    tierlistFromDb.tiers.forEach((tier) => {
      tier.movies.forEach((m) => {
        originalMovieData.set(m.id, {
          tierId: tier.id,
          position: m.position,
          movieOnTierId: m.movieOnTierId,
        })
      })
    })

    // Collect all changes
    const updates: Array<{
      movieOnTierId: string
      tierId: string
      position: number
    }> = []

    const inserts: Array<{
      movieId: string
      tierId: string
      position: number
    }> = []

    finalTiers.forEach((tier) => {
      if (tier.id === 'unranked') return
      tier.movies.forEach((m, index) => {
        const original = originalMovieData.get(m.id)

        if (!original || original.movieOnTierId.startsWith('unranked-')) {
          inserts.push({
            movieId: m.id,
            tierId: tier.id,
            position: index,
          })
          return
        }
        if (!original) return

        const tierChanged = original.tierId !== tier.id
        const positionChanged = original.position !== index

        if (tierChanged || positionChanged) {
          updates.push({
            movieOnTierId: original.movieOnTierId,
            tierId: tier.id,
            position: index,
          })
        }
      })
    })

    // Batch update all changes at once
    if (updates.length > 0) {
      pendingUpdateRef.current = true
      updates.forEach((update) => {
        electricMoviesOnTiersCollection.update(
          update.movieOnTierId,
          (draft) => {
            draft.tierId = update.tierId
            draft.position = update.position
          },
        )
      })
    }

    if (inserts.length > 0) {
      pendingUpdateRef.current = true
      inserts.forEach((insert) => {
        electricMoviesOnTiersCollection.insert({
          id: crypto.randomUUID(),
          movieId: insert.movieId,
          tierId: insert.tierId,
          position: insert.position,
        })
      })
    }

    setIsDragging(false)
  }

  if (!tierlist) {
    return <p className="text-muted-foreground">Tierlist not found.</p>
  }

  // Separate unranked tier from ranked tiers
  const unrankedTier = tierlist.tiers.find((t) => t.id === 'unranked')
  const rankedTiers = tierlist.tiers.filter((t) => t.id !== 'unranked')

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-20">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {tierlist.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Drag and drop movies to organize them into tiers
            </p>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-6">
              {rankedTiers.map((tier) => (
                <TierContainer key={tier.id} id={tier.id} tier={tier} />
              ))}
            </div>
            {unrankedTier && <StickyUnrankedTier tier={unrankedTier} />}
            <DragOverlayPortal />
          </DndContext>
        </div>
      </div>
    </div>
  )
}
