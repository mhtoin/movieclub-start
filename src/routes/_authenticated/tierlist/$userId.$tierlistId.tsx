import { PageTitleBar } from '@/components/page-titlebar'
import DragOverlayPortal from '@/components/tierlist/drag-overlay-portal'
import StickyUnrankedTier from '@/components/tierlist/sticky-unranked-tier'
import TierContainer from '@/components/tierlist/tier-container'
import { TierlistDetailSkeleton } from '@/components/tierlist/tierlist-detail-skeleton'
import { Button } from '@/components/ui/button'
import {
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTrigger,
} from '@/components/ui/dialog'
import Input from '@/components/ui/input'
import { updateTierlist } from '@/lib/react-query/mutations/tierlists'
import { movieQueries } from '@/lib/react-query/queries/movies'
import {
  batchInsertMoviesOnTiers,
  batchUpdateTierMoviePositions,
  tierlistQueries,
  TierWithMovies,
  useSingleTierlistLiveQuery,
} from '@/lib/react-query/queries/tierlists'
import {
  closestCorners,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  getFirstCollision,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Pencil, Tag } from 'lucide-react'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

export const Route = createFileRoute(
  '/_authenticated/tierlist/$userId/$tierlistId',
)({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(tierlistQueries.single(params.tierlistId))
    context.queryClient.prefetchQuery(movieQueries.allWatched())
  },
})

function RouteComponent() {
  return (
    <Suspense fallback={<TierlistDetailSkeleton />}>
      <TierlistContent />
    </Suspense>
  )
}

function TierlistContent() {
  const { userId, tierlistId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const isOwner = user?.userId === userId
  const queryClient = useQueryClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const tierlistFromDb = useSingleTierlistLiveQuery(tierlistId)

  const [localTiers, setLocalTiers] = useState<TierWithMovies[] | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  // When false, server→local syncing is suppressed while mutations are in flight.
  // Opened only after the full mutation chain resolves AND the refetch has landed.
  const [syncEnabled, setSyncEnabled] = useState(true)

  // Promise chain ensuring consecutive drags are serialized on the server
  const mutationChainRef = useRef<Promise<void>>(Promise.resolve())
  // Snapshot of the most-recently submitted visual state used as diff baseline
  const committedTiersRef = useRef<TierWithMovies[] | null>(null)

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

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    // see if there are any droppable containers intersecting
    const pointerCollisions = pointerWithin(args)
    const intersectingCollisions = rectIntersection(args)

    // Prioritize pointer collisions for better UX with empty containers
    let overId = getFirstCollision(pointerCollisions, 'id')

    // If no pointer collision, fall back to rect intersection
    if (!overId) {
      overId = getFirstCollision(intersectingCollisions, 'id')
    }

    // If still no collision, use closest corners as last resort
    if (!overId) {
      const closestCornerCollisions = closestCorners(args)
      overId = getFirstCollision(closestCornerCollisions, 'id')
    }

    return overId ? [{ id: overId }] : []
  }, [])

  // Prefer localTiers whenever it is set (during drag AND while waiting for
  // the server response after drag end), falling back to server data only
  // when localTiers has not been populated yet (e.g. on initial mount).
  const tierlist = useMemo(() => {
    if (!tierlistFromDb) return null
    return {
      ...tierlistFromDb,
      tiers: localTiers ?? tierlistFromDb.tiers,
    }
  }, [tierlistFromDb, localTiers])

  // Sync local state when DB data changes (and not currently dragging).
  // Suppressed while syncEnabled=false (i.e. while our mutations are in flight).
  useEffect(() => {
    if (tierlistFromDb && !isDragging && syncEnabled) {
      committedTiersRef.current = null
      setLocalTiers(tierlistFromDb.tiers)
    }
  }, [tierlistFromDb, isDragging, syncEnabled])

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

    // Build a map of original movie positions/tiers.
    // Use the most-recently committed snapshot when available so that a
    // second drag before the first write lands only diffs its own delta
    // against what was already submitted — not against the stale server data.
    const baselineTiers = committedTiersRef.current ?? tierlistFromDb.tiers
    const originalMovieData = new Map<
      string,
      { tierId: string; position: number; movieOnTierId: string }
    >()
    baselineTiers.forEach((tier) => {
      tier.movies.forEach((m) => {
        originalMovieData.set(m.id, {
          tierId: tier.id,
          position: m.position,
          movieOnTierId: m.movieOnTierId,
        })
      })
    })

    // Record the new visual state as the committed baseline for the next drag
    committedTiersRef.current = finalTiers

    // Collect all changes
    const updates: Array<{
      movieOnTierId: string
      tierId: string
      newPosition: number
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
            newPosition: index,
          })
        }
      })
    })

    // Enqueue this drag's DB work onto the serial mutation chain so that
    // rapid consecutive drags never race each other on the server.
    if (updates.length > 0 || inserts.length > 0) {
      // Disable server→local sync immediately so no stale refetch overwrites
      // the optimistic local state while our writes are in flight.
      setSyncEnabled(false)

      mutationChainRef.current = mutationChainRef.current.then(async () => {
        try {
          if (updates.length > 0) {
            await batchUpdateTierMoviePositions({ data: updates })
          }
          if (inserts.length > 0) {
            await batchInsertMoviesOnTiers({ data: inserts })
          }
        } finally {
          // Await the refetch so that by the time we open the sync gate the
          // query cache already holds the committed server state.
          await queryClient.invalidateQueries({ queryKey: ['tierlists'] })
        }
      })

      // Capture the tip of the chain *after* appending this drag's work.
      // If no further drag is queued before this promise resolves we know we
      // are the last pending mutation and it is safe to re-open the sync gate.
      const drainPromise = mutationChainRef.current
      drainPromise.then(() => {
        if (mutationChainRef.current === drainPromise) {
          // All mutations have committed and the refetch has landed —
          // re-enable sync so the fresh server state is applied.
          setSyncEnabled(true)
        }
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

  const totalRanked = rankedTiers.reduce((acc, t) => acc + t.movies.length, 0)
  const totalUnranked = unrankedTier?.movies.length || 0

  // Format date range for display
  const dateRangeText = (() => {
    if (!tierlist.watchDateFrom && !tierlist.watchDateTo) return null
    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    if (tierlist.watchDateFrom && tierlist.watchDateTo) {
      return `${formatDate(tierlist.watchDateFrom)} — ${formatDate(tierlist.watchDateTo)}`
    }
    if (tierlist.watchDateFrom) {
      return `From ${formatDate(tierlist.watchDateFrom)}`
    }
    return `Until ${formatDate(tierlist.watchDateTo!)}`
  })()

  const renameMutation = useMutation({
    mutationFn: updateTierlist,
  })

  const handleRename = (newTitle: string) => {
    if (!newTitle.trim()) return
    renameMutation.mutate({
      data: {
        id: tierlistId,
        title: newTitle.trim(),
      },
    })
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-2 relative overflow-hidden">
      <PageTitleBar
        title={tierlist.title || 'Untitled Tierlist'}
        kicker={`${rankedTiers.length} ${
          rankedTiers.length === 1 ? 'tier' : 'tiers'
        }, ${totalRanked} ${
          totalRanked === 1 ? 'ranked movie' : 'ranked movies'
        }${
          totalUnranked > 0
            ? `, ${totalUnranked} ${
                totalUnranked === 1 ? 'unranked movie' : 'unranked movies'
              }`
            : ''
        }`}
        actions={
          isOwner && (
            <RenameTierlistDialog
              currentTitle={tierlist.title || 'Untitled Tierlist'}
              onRename={handleRename}
            />
          )
        }
      />
      {(dateRangeText || (tierlist.genres && tierlist.genres.length > 0)) && (
        <div className="flex flex-wrap items-center gap-3 mb-4 px-6">
          {dateRangeText && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateRangeText}</span>
            </div>
          )}
          {tierlist.genres && tierlist.genres.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="flex flex-wrap gap-1.5">
                {tierlist.genres.slice(0, 5).map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {genre}
                  </span>
                ))}
                {tierlist.genres.length > 5 && (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    +{tierlist.genres.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-20">
        <div className="p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-4">
              {rankedTiers.map((tier) => (
                <TierContainer
                  key={tier.id}
                  id={tier.id}
                  tier={tier}
                  isOwner={isOwner}
                />
              ))}
            </div>
            {unrankedTier && (
              <StickyUnrankedTier tier={unrankedTier} isOwner={isOwner} />
            )}
            <DragOverlayPortal />
          </DndContext>
        </div>
      </div>
    </div>
  )
}

function RenameTierlistDialog({
  currentTitle,
  onRename,
}: {
  currentTitle: string
  onRename: (newTitle: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-3.5 h-3.5" />
          Rename
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <RenameTierlistForm
            key={open ? currentTitle : undefined}
            currentTitle={currentTitle}
            onRename={(title) => {
              onRename(title)
              setOpen(false)
            }}
          />
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  )
}

function RenameTierlistForm({
  currentTitle,
  onRename,
}: {
  currentTitle: string
  onRename: (title: string) => void
}) {
  const [title, setTitle] = useState(currentTitle)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRename(title)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold mb-4">Rename Tierlist</h2>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tierlist name"
        className="mb-4"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <DialogClose>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={!title.trim()}>
          Save
        </Button>
      </div>
    </form>
  )
}
