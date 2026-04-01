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
import { Calendar, Loader2, Pencil, Tag } from 'lucide-react'
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
  // Empty sensor set used while a save is in flight — physically prevents
  // a new drag from starting until the previous one has been committed.
  const noSensors = useSensors()

  const tierlistFromDb = useSingleTierlistLiveQuery(tierlistId)

  const [localTiers, setLocalTiers] = useState<TierWithMovies[] | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  // True while a drag's mutations are in flight + refetch is pending.
  // Drives both the disabled-sensor swap and the sync-gate below.
  const [isSaving, setIsSaving] = useState(false)

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

  // Sync local state when server data changes.
  // Gated on !isSaving so in-flight mutations never get overwritten by a
  // stale or intermediate refetch (including SSE-triggered ones).
  useEffect(() => {
    if (tierlistFromDb && !isDragging && !isSaving) {
      setLocalTiers(tierlistFromDb.tiers)
    }
  }, [tierlistFromDb, isDragging, isSaving])

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

    // Diff against the last committed server snapshot.
    // Since isSaving blocks new drags, tierlistFromDb always reflects the
    // state that was committed before this drag started.
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

    if (updates.length > 0 || inserts.length > 0) {
      // Block new drags immediately — prevents any race before we even hit await.
      setIsSaving(true)
      ;(async () => {
        try {
          if (updates.length > 0) {
            await batchUpdateTierMoviePositions({ data: updates })
          }
          if (inserts.length > 0) {
            await batchInsertMoviesOnTiers({ data: inserts })
          }
          // Wait for the refetch to complete so tierlistFromDb is already
          // up-to-date when isSaving flips to false and the useEffect fires.
          await queryClient.invalidateQueries({ queryKey: ['tierlists'] })
        } finally {
          setIsSaving(false)
        }
      })()
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
    <div className="container mx-auto px-2 sm:px-4 py-2 relative overflow-hidden md:pl-[72px]">
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

      <div className="relative flex-1 overflow-y-auto pr-20">
        {isSaving && (
          <>
            <div className="absolute inset-0 z-20 cursor-wait" />
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-border/60 bg-background/95 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Saving…
            </div>
          </>
        )}
        <div className="p-6">
          <DndContext
            sensors={isSaving ? noSensors : sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div
              className={`space-y-4 transition-opacity duration-200 ${isSaving ? 'opacity-50' : ''}`}
            >
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
              <StickyUnrankedTier
                tier={unrankedTier}
                isOwner={isOwner}
                disabled={isSaving}
              />
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
