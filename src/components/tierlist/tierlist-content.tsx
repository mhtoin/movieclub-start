import DragOverlayPortal from '@/components/tierlist/drag-overlay-portal'
import StickyUnrankedTier from '@/components/tierlist/sticky-unranked-tier'
import TierContainer from '@/components/tierlist/tier-container'
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
import { PageTitleBar } from '@/components/page-titlebar'
import { updateTierlist } from '@/lib/react-query/mutations/tierlists'
import {
  batchInsertMoviesOnTiers,
  batchUpdateTierMoviePositions,
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
import { Calendar, Loader2, Pencil, Tag } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

interface TierlistContentProps {
  tierlistId: string
  isOwner: boolean
}

export function TierlistContent({
  tierlistId,
  isOwner,
}: TierlistContentProps) {
  const queryClient = useQueryClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const noSensors = useSensors()

  const tierlistFromDb = useSingleTierlistLiveQuery(tierlistId)

  const [localTiers, setLocalTiers] = useState<TierWithMovies[] | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const localTiersRef = useRef(localTiers)
  localTiersRef.current = localTiers

  const containerMap = useMemo(() => {
    const map = new Map<string, string>()
    const tiers = localTiers ?? tierlistFromDb?.tiers
    if (!tiers) return map

    tiers.forEach((tier) => {
      map.set(tier.id, tier.id)
      tier.movies.forEach((m) => map.set(m.id, tier.id))
    })
    return map
  }, [localTiers, tierlistFromDb?.tiers])

  const findContainer = useCallback(
    (id: string): string | null => containerMap.get(id) ?? null,
    [containerMap],
  )

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args)
    const intersectingCollisions = rectIntersection(args)

    let overId = getFirstCollision(pointerCollisions, 'id')

    if (!overId) {
      overId = getFirstCollision(intersectingCollisions, 'id')
    }

    if (!overId) {
      const closestCornerCollisions = closestCorners(args)
      overId = getFirstCollision(closestCornerCollisions, 'id')
    }

    return overId ? [{ id: overId }] : []
  }, [])

  const tierlist = useMemo(() => {
    if (!tierlistFromDb) return null
    return {
      ...tierlistFromDb,
      tiers: localTiers ?? tierlistFromDb.tiers,
    }
  }, [tierlistFromDb, localTiers])

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

        const movedMovie = activeTier.movies[activeMovieIndex]

        let newIndex: number
        if (overId === overContainer) {
          newIndex = overTier.movies.length
        } else {
          const overIndex = overTier.movies.findIndex((m) => m.id === overId)
          newIndex = overIndex >= 0 ? overIndex : overTier.movies.length
        }

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
          const reorderedMovies = arrayMove(tier.movies, activeIndex, overIndex)
          finalTiers = currentLocalTiers.map((t) =>
            t.id === currentContainer ? { ...t, movies: reorderedMovies } : t,
          )
          setLocalTiers(finalTiers)
        }
      }
    }

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
      setIsSaving(true)
      ;(async () => {
        try {
          if (updates.length > 0) {
            await batchUpdateTierMoviePositions({ data: updates })
          }
          if (inserts.length > 0) {
            await batchInsertMoviesOnTiers({ data: inserts })
          }
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

  const unrankedTier = tierlist.tiers.find((t) => t.id === 'unranked')
  const rankedTiers = tierlist.tiers.filter((t) => t.id !== 'unranked')

  const totalRanked = rankedTiers.reduce((acc, t) => acc + t.movies.length, 0)
  const totalUnranked = unrankedTier?.movies.length || 0

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

      <div className="relative flex-1 overflow-y-auto pr-4 md:pr-20">
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
