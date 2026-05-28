import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Toast } from '@base-ui/react/toast'
import { format } from 'date-fns'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  Infinity as InfinityIcon,
  Loader2,
  Pencil,
  Share2,
  Tag,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import type { TierWithMovies } from '@/lib/react-query/queries/tierlists'
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
import {
  SelectItem,
  SelectPopup,
  SelectRoot,
  SelectTrigger,
} from '@/components/ui/select'
import { PageTitleBar } from '@/components/page-titlebar'
import { updateTierlist } from '@/lib/react-query/mutations/tierlists'
import {
  batchInsertMoviesOnTiers,
  batchUpdateTierMoviePositions,
  useSingleTierlistLiveQuery,
} from '@/lib/react-query/queries/tierlists'
import { TierlistShareStudio } from '@/components/tierlist/share-studio'

interface TierlistContentProps {
  tierlistId: string
  isOwner: boolean
  userName?: string | null
}

export function TierlistContent({
  tierlistId,
  isOwner,
  userName,
}: TierlistContentProps) {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const noSensors = useSensors()

  const tierlistFromDb = useSingleTierlistLiveQuery(tierlistId)

  const [localTiers, setLocalTiers] = useState<Array<TierWithMovies> | null>(
    null,
  )
  const isDragging = useRef(false)
  const [isSaving, setIsSaving] = useState(false)
  const [studioOpen, setStudioOpen] = useState(false)

  const localTiersRef = useRef(localTiers)
  useEffect(() => {
    localTiersRef.current = localTiers
  }, [localTiers])

  const containerMap = useMemo(() => {
    const map = new Map<string, string>()
    const tiers = localTiers ?? tierlistFromDb?.tiers
    if (!tiers) return map

    tiers.forEach((tier) => {
      map.set(tier.id, tier.id)
      tier.movies.forEach((movie) => map.set(movie.id, tier.id))
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
    if (tierlistFromDb && !isDragging.current && !isSaving) {
      setLocalTiers(tierlistFromDb.tiers)
    }
  }, [tierlistFromDb, isSaving])

  const editMutation = useMutation({
    mutationFn: updateTierlist,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tierlists'] })
    },
  })

  function handleDragStart() {
    isDragging.current = true
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
          (movie) => movie.id === activeId,
        )
        if (activeMovieIndex === -1) return prevTiers

        const movedMovie = activeTier.movies[activeMovieIndex]

        let newIndex: number
        if (overId === overContainer) {
          newIndex = overTier.movies.length
        } else {
          const overIndex = overTier.movies.findIndex(
            (movie) => movie.id === overId,
          )
          newIndex = overIndex >= 0 ? overIndex : overTier.movies.length
        }

        const newTiers = prevTiers.map((tier, index) => {
          if (index === activeTierIndex) {
            return {
              ...tier,
              movies: tier.movies.filter((movie) => movie.id !== activeId),
            }
          }
          if (index === overTierIndex) {
            const newMovies = [
              ...tier.movies.filter((movie) => movie.id !== activeId),
            ]
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
      isDragging.current = false
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    const currentContainer = findContainer(activeId)
    const targetContainer = findContainer(overId)

    if (!currentContainer || !targetContainer) {
      isDragging.current = false
      return
    }

    let finalTiers = currentLocalTiers
    if (currentContainer === targetContainer) {
      const tier = currentLocalTiers.find((t) => t.id === currentContainer)
      if (tier) {
        const activeIndex = tier.movies.findIndex(
          (movie) => movie.id === activeId,
        )
        const overIndex = tier.movies.findIndex((movie) => movie.id === overId)

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
      tier.movies.forEach((movie) => {
        originalMovieData.set(movie.id, {
          tierId: tier.id,
          position: movie.position,
          movieOnTierId: movie.movieOnTierId,
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
      tier.movies.forEach((movie, index) => {
        const original = originalMovieData.get(movie.id)

        if (!original || original.movieOnTierId.startsWith('unranked-')) {
          inserts.push({
            movieId: movie.id,
            tierId: tier.id,
            position: index,
          })
          return
        }

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
          const results: Array<{
            movieId: string
            reviewId: string
            tierLabel: string
            stars: number
            movieTitle: string
          }> = []
          if (updates.length > 0) {
            const updateResult = await batchUpdateTierMoviePositions({
              data: updates,
            })
            if (updateResult.autoReviews.length) {
              results.push(...updateResult.autoReviews)
            }
          }
          if (inserts.length > 0) {
            const insertResult = await batchInsertMoviesOnTiers({
              data: inserts,
            })
            if (insertResult.autoReviews.length) {
              results.push(...insertResult.autoReviews)
            }
          }
          await queryClient.invalidateQueries({ queryKey: ['tierlists'] })

          for (const review of results) {
            toastManager.add({
              title: review.movieTitle,
              description: (
                <span>
                  Ranked in {review.tierLabel} &mdash; {review.stars}{' '}
                  {review.stars === 1 ? 'star' : 'stars'}.{' '}
                  <Link
                    to="/watched/$movieId"
                    params={{ movieId: review.movieId }}
                    className="text-primary underline underline-offset-2 font-medium hover:text-primary/80"
                  >
                    Write your thoughts?
                  </Link>
                </span>
              ),
              type: 'default',
            })
          }
        } finally {
          setIsSaving(false)
        }
      })()
    }

    isDragging.current = false
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

  const handleEdit = (data: {
    title: string
    watchDateFrom?: string
    watchDateTo?: string
  }) => {
    if (!data.title.trim()) return
    editMutation.mutate({
      data: {
        id: tierlistId,
        title: data.title.trim(),
        watchDateFrom: data.watchDateFrom,
        watchDateTo: data.watchDateTo,
      },
    })
  }

  return (
    <LazyMotion features={domAnimation}>
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setStudioOpen(true)}
              >
                <Share2 className="size-3.5" />
                Share
              </Button>
              {isOwner && (
                <EditTierlistDialog
                  tierlist={tierlist}
                  onEdit={handleEdit}
                  isPending={editMutation.isPending}
                />
              )}
            </div>
          }
        />
        {(dateRangeText || (tierlist.genres && tierlist.genres.length > 0)) && (
          <div className="flex flex-wrap items-center gap-3 mb-4 px-6">
            {dateRangeText && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
                <Calendar className="size-3.5" />
                <span>{dateRangeText}</span>
              </div>
            )}
            {tierlist.genres && tierlist.genres.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="size-3.5 text-muted-foreground" />
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

        <TierlistShareStudio
          tierlist={tierlist}
          userName={userName}
          open={studioOpen}
          onOpenChange={setStudioOpen}
        />
      </div>
    </LazyMotion>
  )
}

function EditTierlistDialog({
  tierlist,
  onEdit,
  isPending,
}: {
  tierlist: NonNullable<ReturnType<typeof useSingleTierlistLiveQuery>>
  onEdit: (data: {
    title: string
    watchDateFrom?: string
    watchDateTo?: string
  }) => void
  isPending: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <EditTierlistForm
            key={open ? 'open' : 'closed'}
            tierlist={tierlist}
            onEdit={(data) => {
              onEdit(data)
              setOpen(false)
            }}
            isPending={isPending}
          />
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  )
}

const easeOut = [0.22, 1, 0.36, 1] as const

function EditTierlistForm({
  tierlist,
  onEdit,
  isPending,
}: {
  tierlist: NonNullable<ReturnType<typeof useSingleTierlistLiveQuery>>
  onEdit: (data: {
    title: string
    watchDateFrom?: string
    watchDateTo?: string
  }) => void
  isPending: boolean
}) {
  const [title, setTitle] = useState(tierlist.title || '')
  const [datePreset, setDatePreset] = useState<string | null>(() => {
    const from = tierlist.watchDateFrom
      ? new Date(tierlist.watchDateFrom)
      : null
    const to = tierlist.watchDateTo ? new Date(tierlist.watchDateTo) : null
    const now = new Date()

    if (!from && !to) return 'all-time'
    if (
      from &&
      to &&
      from.getMonth() === 0 &&
      from.getDate() === 1 &&
      to.getMonth() === 11 &&
      to.getDate() === 31
    ) {
      if (from.getFullYear() === now.getFullYear()) return 'this-year'
      if (from.getFullYear() === now.getFullYear() - 1) return 'last-year'
    }
    return 'custom-range'
  })
  const [watchDateFrom, setWatchDateFrom] = useState<Date | undefined>(
    tierlist.watchDateFrom ? new Date(tierlist.watchDateFrom) : undefined,
  )
  const [watchDateTo, setWatchDateTo] = useState<Date | undefined>(
    tierlist.watchDateTo ? new Date(tierlist.watchDateTo) : undefined,
  )
  const [fromYear, setFromYear] = useState<string>(
    tierlist.watchDateFrom
      ? String(new Date(tierlist.watchDateFrom).getFullYear())
      : '',
  )
  const [toYear, setToYear] = useState<string>(
    tierlist.watchDateTo
      ? String(new Date(tierlist.watchDateTo).getFullYear())
      : '',
  )

  const yearOptions = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(
        (year) => String(year),
      ),
    [],
  )

  const handleDatePreset = (preset: string) => {
    setDatePreset(preset)
    const now = new Date()
    if (preset === 'this-year') {
      setWatchDateFrom(new Date(now.getFullYear(), 0, 1))
      setWatchDateTo(new Date(now.getFullYear(), 11, 31))
      setFromYear('')
      setToYear('')
    } else if (preset === 'last-year') {
      setWatchDateFrom(new Date(now.getFullYear() - 1, 0, 1))
      setWatchDateTo(new Date(now.getFullYear() - 1, 11, 31))
      setFromYear('')
      setToYear('')
    } else if (preset === 'custom-range') {
      setWatchDateFrom(undefined)
      setWatchDateTo(undefined)
      setFromYear(String(now.getFullYear()))
      setToYear(String(now.getFullYear()))
    } else if (preset === 'all-time') {
      setWatchDateFrom(undefined)
      setWatchDateTo(undefined)
      setFromYear('')
      setToYear('')
    }
  }

  const handleFromYearChange = (value: string | null) => {
    const year = value ?? ''
    setFromYear(year)
    if (year) {
      setWatchDateFrom(new Date(Number(year), 0, 1))
    } else {
      setWatchDateFrom(undefined)
    }
  }

  const handleToYearChange = (value: string | null) => {
    const year = value ?? ''
    setToYear(year)
    if (year) {
      setWatchDateTo(new Date(Number(year), 11, 31))
    } else {
      setWatchDateTo(undefined)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit({
      title: title.trim(),
      watchDateFrom: watchDateFrom
        ? format(watchDateFrom, 'yyyy-MM-dd')
        : undefined,
      watchDateTo: watchDateTo ? format(watchDateTo, 'yyyy-MM-dd') : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold">Edit Tierlist</h2>

      <div className="space-y-3">
        <label
          htmlFor="edit-tierlist-title"
          className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          <Tag className="h-4 w-4" />
          Title
        </label>
        <Input
          id="edit-tierlist-title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
          placeholder="Tierlist name"
        />
      </div>

      <div className="space-y-3">
        <span className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <CalendarRange className="h-4 w-4" />
          Time Period
        </span>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              {
                value: 'this-year',
                label: 'This Year',
                icon: CalendarDays,
              },
              {
                value: 'last-year',
                label: 'Last Year',
                icon: Clock,
              },
              {
                value: 'custom-range',
                label: 'Custom Range',
                icon: CalendarRange,
              },
              { value: 'all-time', label: 'All Time', icon: InfinityIcon },
            ] as const
          ).map((preset) => {
            const Icon = preset.icon
            const active = datePreset === preset.value
            return (
              <Button
                key={preset.value}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDatePreset(preset.value)}
                className={`relative flex items-center gap-2.5 rounded-xl h-auto px-3 py-2.5 text-left justify-start font-normal ${
                  active
                    ? 'border border-primary/40 bg-primary/[0.07] text-foreground shadow-sm'
                    : 'border border-border bg-muted text-foreground hover:border-primary/30 hover:bg-primary/[0.05]'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <span className="text-sm font-medium">{preset.label}</span>
                {active && (
                  <m.div
                    layoutId="edit-time-preset-glow"
                    className="absolute inset-0 rounded-xl ring-1 ring-primary/20"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Button>
            )
          })}
        </div>

        <AnimatePresence>
          {datePreset === 'custom-range' && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 pt-1">
                <SelectRoot
                  value={fromYear}
                  onValueChange={handleFromYearChange}
                >
                  <SelectTrigger
                    size="sm"
                    placeholder="From year"
                    className="flex-1"
                  />
                  <SelectPopup positionerClassName="z-[120]">
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </SelectRoot>
                <span className="text-muted-foreground text-sm font-medium">
                  to
                </span>
                <SelectRoot value={toYear} onValueChange={handleToYearChange}>
                  <SelectTrigger
                    size="sm"
                    placeholder="To year"
                    className="flex-1"
                  />
                  <SelectPopup positionerClassName="z-[120]">
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </SelectRoot>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-end gap-2">
        <DialogClose>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={!title.trim() || isPending}>
          {isPending ? (
            <>
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              Saving…
            </>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </form>
  )
}
