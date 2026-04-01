import { PageTitleBar } from '@/components/page-titlebar'
import { Button } from '@/components/ui/button'
import {
  DialogBackdrop,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTrigger,
} from '@/components/ui/dialog'
import Input from '@/components/ui/input'
import {
  createTierlist,
  deleteTierlist,
} from '@/lib/react-query/mutations/tierlists'
import {
  tierlistQueries,
  type TierlistWithDetails,
} from '@/lib/react-query/queries/tierlists'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { getImageUrl } from '@/lib/tmdb-api'
import { Toast } from '@base-ui/react/toast'
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  Calendar,
  ChevronRight,
  Film,
  Layers,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_authenticated/tierlist/$userId/')({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(tierlistQueries.user(params.userId))
  },
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const { data } = useSuspenseQuery(tierlistQueries.user(userId))
  const tierlists = data as TierlistWithDetails[]
  const isOwner = user?.userId === userId

  return (
    <div className="container mx-auto px-4 py-6 md:pl-[72px]">
      <PageTitleBar
        title={isOwner ? 'Your Tierlists' : 'Tierlists'}
        description={
          isOwner
            ? 'Manage and organize your movie rankings'
            : `Browse ${user?.name || 'this user'}'s movie rankings`
        }
        actions={isOwner && <CreateTierlistDialog userId={userId} />}
      />

      <div className="max-w-6xl mx-auto">
        {tierlists.length === 0 ? (
          <EmptyState isOwner={isOwner} userId={userId} />
        ) : (
          <>
            <FeaturedTierlist
              tierlist={tierlists[0]}
              userId={userId}
              isOwner={isOwner}
            />
            {tierlists.length > 1 && (
              <div className="mt-12">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  All Tierlists
                </h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {tierlists.slice(1).map((list) => (
                    <TierlistCard
                      key={list.id}
                      tierlist={list}
                      userId={userId}
                      isOwner={isOwner}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ isOwner, userId }: { isOwner: boolean; userId: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 p-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Layers className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No tierlists yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {isOwner
          ? 'Create your first tierlist to start ranking your favorite movies.'
          : "This user hasn't created any tierlists yet."}
      </p>
      {isOwner && <CreateTierlistDialog userId={userId} />}
    </div>
  )
}

function FeaturedTierlist({
  tierlist,
  userId,
  isOwner,
}: {
  tierlist: TierlistWithDetails
  userId: string
  isOwner: boolean
}) {
  const movieCount = tierlist.tiers.reduce(
    (acc, tier) => acc + (tier.moviesOnTiers?.length || 0),
    0,
  )

  const posterMovies = tierlist.tiers
    .flatMap((tier) => (tier.moviesOnTiers || []).map((mot) => mot.movie))
    .filter((movie): movie is NonNullable<typeof movie> & { images: any } =>
      Boolean(movie && movie.images),
    )
    .slice(0, 6)

  return (
    <Link
      to="/tierlist/$userId/$tierlistId"
      params={{ userId, tierlistId: tierlist.id }}
      className="group block"
    >
      <article className="relative rounded-2xl overflow-hidden border border-border/50 bg-card">
        {posterMovies.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 h-48 md:h-64">
            {posterMovies.map((movie, idx) => {
              const posterUrl = getImageUrl(
                movie.images?.posters?.[0]?.file_path,
                'w342',
              )
              return (
                <div
                  key={movie.id || idx}
                  className="aspect-[2/3] overflow-hidden bg-muted"
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center p-2">
                      <p className="text-xs text-muted-foreground text-center line-clamp-3">
                        {movie.title}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                {tierlist.watchDateFrom && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(tierlist.watchDateFrom).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        year: 'numeric',
                      },
                    )}
                  </span>
                )}
                {tierlist.watchDateTo && (
                  <>
                    <span>—</span>
                    <span>
                      {new Date(tierlist.watchDateTo).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          year: 'numeric',
                        },
                      )}
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                {tierlist.title || 'Untitled'}
              </h2>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  {tierlist.tiers.length} tiers
                </span>
                <span className="flex items-center gap-1.5">
                  <Film className="w-4 h-4" />
                  {movieCount} movies
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <DeleteButton tierlistId={tierlist.id} userId={userId} />
              )}
              <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {tierlist.genres && tierlist.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tierlist.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {tierlist.tiers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tierlist.tiers.slice(0, 6).map((tier) => (
                <span
                  key={tier.id}
                  className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium"
                >
                  {tier.label}
                </span>
              ))}
              {tierlist.tiers.length > 6 && (
                <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                  +{tierlist.tiers.length - 6} more
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}

function TierlistCard({
  tierlist,
  userId,
  isOwner,
}: {
  tierlist: TierlistWithDetails
  userId: string
  isOwner: boolean
}) {
  const movieCount = tierlist.tiers.reduce(
    (acc, tier) => acc + (tier.moviesOnTiers?.length || 0),
    0,
  )

  const posterMovies = tierlist.tiers
    .flatMap((tier) => (tier.moviesOnTiers || []).map((mot) => mot.movie))
    .filter((movie): movie is NonNullable<typeof movie> & { images: any } =>
      Boolean(movie && movie.images),
    )
    .slice(0, 4)

  return (
    <Link
      to="/tierlist/$userId/$tierlistId"
      params={{ userId, tierlistId: tierlist.id }}
      className="group block"
    >
      <article className="relative rounded-xl overflow-hidden border border-border/50 bg-card p-4 hover:border-border transition-colors">
        <div className="flex gap-4">
          {posterMovies.length > 0 && (
            <div className="flex gap-0.5 h-24 w-24 shrink-0 rounded-lg overflow-hidden bg-muted">
              {posterMovies.map((movie, idx) => {
                const posterUrl = getImageUrl(
                  movie.images?.posters?.[0]?.file_path,
                  'w92',
                )
                return (
                  <div key={movie.id || idx} className="flex-1 overflow-hidden">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {tierlist.title || 'Untitled'}
            </h3>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {tierlist.tiers.length}
              </span>
              <span className="flex items-center gap-1">
                <Film className="w-3 h-3" />
                {movieCount}
              </span>
            </div>

            {tierlist.genres && tierlist.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tierlist.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            {isOwner && (
              <DeleteButton tierlistId={tierlist.id} userId={userId} compact />
            )}
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </article>
    </Link>
  )
}

function DeleteButton({
  tierlistId,
  userId,
  compact = false,
}: {
  tierlistId: string
  userId: string
  compact?: boolean
}) {
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  const deleteMutation = useMutation({
    mutationFn: deleteTierlist,
    onSuccess: () => {
      toastManager.add({
        title: 'Deleted',
        description: 'Tierlist removed',
        type: 'success',
      })
      queryClient.invalidateQueries({
        queryKey: tierlistQueries.user(userId).queryKey,
      })
    },
    onError: () => {
      toastManager.add({
        title: 'Error',
        description: 'Failed to delete',
        type: 'error',
      })
    },
  })

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (confirm('Delete this tierlist?')) {
            deleteMutation.mutate({ data: { id: tierlistId } })
          }
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-destructive"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (confirm('Delete this tierlist?')) {
          deleteMutation.mutate({ data: { id: tierlistId } })
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}

function CreateTierlistDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [datePreset, setDatePreset] = useState<string | null>(null)
  const [watchDateFrom, setWatchDateFrom] = useState<Date | undefined>(
    undefined,
  )
  const [watchDateTo, setWatchDateTo] = useState<Date | undefined>(undefined)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [tiers, setTiers] = useState([
    { label: 'S', value: 0 },
    { label: 'A', value: 1 },
    { label: 'B', value: 2 },
    { label: 'C', value: 3 },
    { label: 'D', value: 4 },
  ])

  const { data: genresData = [] } = useQuery(tmdbQueries.genres())

  const genreIdToLabel = useMemo(() => {
    const map = new Map<string, string>()
    genresData.forEach((genre) => {
      map.set(genre.value, genre.label)
    })
    return map
  }, [genresData])

  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()
  const createMutation = useMutation({
    mutationFn: createTierlist,
    onSuccess: () => {
      toastManager.add({
        title: 'Created',
        description: 'Tierlist is ready',
        type: 'success',
      })
      handleClose()
      queryClient.invalidateQueries({
        queryKey: tierlistQueries.user(userId).queryKey,
      })
    },
    onError: () => {
      toastManager.add({
        title: 'Error',
        description: 'Failed to create',
        type: 'error',
      })
    },
  })

  const handleClose = () => {
    setOpen(false)
    setStep(1)
    setTitle('')
    setDatePreset(null)
    setWatchDateFrom(undefined)
    setWatchDateTo(undefined)
    setSelectedGenres([])
    setTiers([
      { label: 'S', value: 0 },
      { label: 'A', value: 1 },
      { label: 'B', value: 2 },
      { label: 'C', value: 3 },
      { label: 'D', value: 4 },
    ])
  }

  const handleDatePreset = (preset: string) => {
    setDatePreset(preset)
    const now = new Date()
    if (preset === 'this-year') {
      setWatchDateFrom(new Date(now.getFullYear(), 0, 1))
      setWatchDateTo(new Date(now.getFullYear(), 11, 31))
    } else if (preset === '2020s') {
      setWatchDateFrom(new Date(2020, 0, 1))
      setWatchDateTo(new Date(2029, 11, 31))
    } else if (preset === '2010s') {
      setWatchDateFrom(new Date(2010, 0, 1))
      setWatchDateTo(new Date(2019, 11, 31))
    } else if (preset === 'all-time') {
      setWatchDateFrom(undefined)
      setWatchDateTo(undefined)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const genreLabels = selectedGenres
      .map((id) => genreIdToLabel.get(id))
      .filter((label): label is string => label !== undefined)

    createMutation.mutate({
      data: {
        title,
        watchDateFrom: watchDateFrom
          ? format(watchDateFrom, 'yyyy-MM-dd')
          : undefined,
        watchDateTo: watchDateTo
          ? format(watchDateTo, 'yyyy-MM-dd')
          : undefined,
        genres: genreLabels,
        tiers,
      },
    })
  }

  const addTier = () => {
    setTiers([...tiers, { label: 'New Tier', value: tiers.length }])
  }

  const removeTier = (index: number) => {
    setTiers(
      tiers.filter((_, i) => i !== index).map((t, i) => ({ ...t, value: i })),
    )
  }

  const updateTierLabel = (index: number, label: string) => {
    const newTiers = [...tiers]
    newTiers[index].label = label
    setTiers(newTiers)
  }

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Tierlist
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPopup className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 sm:max-w-[440px]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Create Tierlist</h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-1 mb-6">
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step >= 1 ? 'bg-primary' : 'bg-muted'
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step >= 2 ? 'bg-primary' : 'bg-muted'
                }`}
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div
                className="transition-all duration-300 ease-out"
                style={{
                  opacity: step === 1 ? 1 : 0,
                  transform: step === 1 ? 'translateX(0)' : 'translateX(-16px)',
                  display: step === 1 ? 'block' : 'none',
                  position: step === 1 ? 'relative' : 'absolute',
                }}
              >
                <p className="text-sm text-muted-foreground mb-5">
                  Choose which movies to include
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      required
                      autoFocus
                      value={title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTitle(e.target.value)
                      }
                      placeholder="My Movie Rankings"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Period</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'this-year', label: 'This Year' },
                        { value: '2020s', label: '2020s' },
                        { value: '2010s', label: '2010s' },
                        { value: 'all-time', label: 'All Time' },
                      ].map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => handleDatePreset(preset.value)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                            datePreset === preset.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Genres</label>
                    <div className="flex flex-wrap gap-2">
                      {genresData.slice(0, 8).map((genre) => (
                        <button
                          key={genre.value}
                          type="button"
                          onClick={() => {
                            if (selectedGenres.includes(genre.value)) {
                              setSelectedGenres(
                                selectedGenres.filter((g) => g !== genre.value),
                              )
                            } else {
                              setSelectedGenres([
                                ...selectedGenres,
                                genre.value,
                              ])
                            }
                          }}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                            selectedGenres.includes(genre.value)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                          }`}
                        >
                          {genre.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!title.trim()}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div
                className="transition-all duration-300 ease-out"
                style={{
                  opacity: step === 2 ? 1 : 0,
                  transform: step === 2 ? 'translateX(0)' : 'translateX(16px)',
                  display: step === 2 ? 'block' : 'none',
                  position: step === 2 ? 'relative' : 'absolute',
                }}
              >
                <p className="text-sm text-muted-foreground mb-5">
                  Customize your tier labels (optional)
                </p>

                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                  {tiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-6 text-sm font-medium text-muted-foreground text-center">
                        {index + 1}
                      </span>
                      <Input
                        value={tier.label}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateTierLabel(index, e.target.value)
                        }
                        className="h-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTier(index)}
                        disabled={tiers.length <= 1}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addTier}
                  className="mt-3 w-full h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Tier
                </Button>

                <div className="flex justify-between mt-6 pt-4 border-t border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="gap-2"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Back
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  )
}
