import { GenreFilter } from '@/components/discover/genre-filter'
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
import { tierlistQueries } from '@/lib/react-query/queries/tierlists'
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
import {
  Calendar,
  Film,
  Layers,
  Plus,
  Star,
  Trash2,
  TrendingUp,
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
  const { data: tierlists } = useSuspenseQuery(tierlistQueries.user(userId))
  const isOwner = user?.userId === userId
  const queryClient = useQueryClient()
  const toastManager = Toast.useToastManager()

  const deleteMutation = useMutation({
    mutationFn: deleteTierlist,
    onSuccess: () => {
      toastManager.add({ title: 'Success', description: 'Tierlist deleted' })
      queryClient.invalidateQueries({
        queryKey: tierlistQueries.user(userId).queryKey,
      })
    },
    onError: () => {
      toastManager.add({
        title: 'Error',
        description: 'Failed to delete tierlist',
      })
    },
  })

  const totalMovies = tierlists.reduce(
    (acc, list) =>
      acc +
      list.tiers.reduce(
        (tierAcc, tier) => tierAcc + (tier.moviesOnTiers?.length || 0),
        0,
      ),
    0,
  )

  return (
    <div className="container mx-auto px-2 sm:px-4 py-2 relative overflow-hidden">
      <PageTitleBar
        title="Tierlists"
        description={`Browse tierlists created by ${
          isOwner ? 'you' : 'this user'
        }.`}
      />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {tierlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 p-16 text-center bg-muted/20 min-h-[400px]">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
              <Layers className="w-10 h-10 text-primary/50" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No tierlists yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {isOwner
                ? 'Create your first tierlist to start ranking and organizing your favorite movies by genre, era, or any custom criteria.'
                : "This user hasn't created any tierlists yet. Check back later!"}
            </p>
            {isOwner && <CreateTierlistDialog userId={userId} />}
          </div>
        ) : (
          <>
            {isOwner && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Total Tierlists
                    </span>
                    <div className="rounded-full bg-primary/10 p-2">
                      <Layers className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{tierlists.length}</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Total Movies Ranked
                    </span>
                    <div className="rounded-full bg-primary/10 p-2">
                      <Film className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{totalMovies}</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Avg Movies/List
                    </span>
                    <div className="rounded-full bg-primary/10 p-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">
                    {tierlists.length > 0
                      ? Math.round(totalMovies / tierlists.length)
                      : 0}
                  </div>
                </div>
              </div>
            )}

            {isOwner && (
              <div className="flex justify-end mb-6">
                <CreateTierlistDialog userId={userId} />
              </div>
            )}

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {tierlists.map((list) => {
                const movieCount = list.tiers.reduce(
                  (acc, tier) => acc + (tier.moviesOnTiers?.length || 0),
                  0,
                )

                // Get all movies from all tiers for poster display
                const allMovies = list.tiers
                  .flatMap((tier) =>
                    (tier.moviesOnTiers || []).map((mot) => mot.movie),
                  )
                  .filter(Boolean)

                // Get top 4 movies for poster display
                const posterMovies = allMovies.slice(0, 4)

                return (
                  <Link
                    key={list.id}
                    to="/tierlist/$userId/$tierlistId"
                    params={{ userId, tierlistId: list.id }}
                    className="group block"
                  >
                    <div className="relative bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/40 hover:shadow-primary/5 h-full">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-primary/60 to-primary/20" />

                      <div className="p-6 pl-8">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors mb-1">
                              {list.title}
                            </h3>
                            {(list.watchDateFrom || list.watchDateTo) && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {list.watchDateFrom &&
                                  new Date(
                                    list.watchDateFrom,
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                {list.watchDateFrom &&
                                  list.watchDateTo &&
                                  ' — '}
                                {list.watchDateTo &&
                                  new Date(list.watchDateTo).toLocaleDateString(
                                    'en-US',
                                    {
                                      month: 'short',
                                      year: 'numeric',
                                    },
                                  )}
                              </p>
                            )}
                          </div>
                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 ml-3 flex-shrink-0"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (
                                  confirm(
                                    'Are you sure you want to delete this tierlist?',
                                  )
                                ) {
                                  deleteMutation.mutate({
                                    data: { id: list.id },
                                  })
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {posterMovies.length > 0 && (
                          <div className="mb-4 rounded-lg overflow-hidden border border-border/30">
                            <div
                              className={`grid ${posterMovies.length === 1 ? 'grid-cols-1' : posterMovies.length === 2 ? 'grid-cols-2' : posterMovies.length === 3 ? 'grid-cols-3' : 'grid-cols-4'} gap-0.5 bg-muted/20`}
                            >
                              {posterMovies.map((movie, idx) => {
                                const posterUrl = getImageUrl(
                                  movie.images?.posters?.[0]?.file_path,
                                  'w185',
                                )
                                return (
                                  <div
                                    key={movie.id || idx}
                                    className="aspect-[2/3] overflow-hidden bg-muted relative group/poster"
                                  >
                                    {posterUrl ? (
                                      <>
                                        <img
                                          src={posterUrl}
                                          alt={movie.title}
                                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center">
                                          <div className="text-white text-center px-2">
                                            <p className="text-xs font-semibold line-clamp-2">
                                              {movie.title}
                                            </p>
                                            {movie.voteAverage && (
                                              <div className="flex items-center justify-center gap-1 mt-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs">
                                                  {movie.voteAverage.toFixed(1)}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center p-2">
                                        <p className="text-[10px] text-muted-foreground text-center line-clamp-3">
                                          {movie.title}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {list.genres && list.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {list.genres.slice(0, 4).map((genre) => (
                              <span
                                key={genre}
                                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                              >
                                {genre}
                              </span>
                            ))}
                            {list.genres.length > 4 && (
                              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                +{list.genres.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-6 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <div className="rounded-md bg-primary/10 p-1.5">
                              <Layers className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">
                                {list.tiers.length}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                tiers
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="rounded-md bg-primary/10 p-1.5">
                              <Film className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">{movieCount}</div>
                              <div className="text-xs text-muted-foreground">
                                movies
                              </div>
                            </div>
                          </div>
                        </div>

                        {list.tiers.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Tier Breakdown
                            </p>
                            <div className="space-y-2">
                              {list.tiers.slice(0, 5).map((tier, index) => {
                                const tierMovieCount =
                                  tier.moviesOnTiers?.length || 0
                                const percentage =
                                  movieCount > 0
                                    ? (tierMovieCount / movieCount) * 100
                                    : 0
                                return (
                                  <div key={tier.id} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-primary/20 text-[9px] font-bold text-primary flex-shrink-0">
                                          {index + 1}
                                        </span>
                                        <span className="text-xs font-medium text-foreground line-clamp-1">
                                          {tier.label}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                                        {tierMovieCount} ·{' '}
                                        {percentage.toFixed(0)}%
                                      </span>
                                    </div>
                                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary/60 rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                              {list.tiers.length > 5 && (
                                <p className="text-xs text-muted-foreground italic pt-1">
                                  +{list.tiers.length - 5} more tiers
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
function CreateTierlistDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [watchDateFrom, setWatchDateFrom] = useState('')
  const [watchDateTo, setWatchDateTo] = useState('')
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
      toastManager.add({ title: 'Success', description: 'Tierlist created' })
      setOpen(false)
      setTitle('')
      setWatchDateFrom('')
      setWatchDateTo('')
      setSelectedGenres([])
      setTiers([
        { label: 'S', value: 0 },
        { label: 'A', value: 1 },
        { label: 'B', value: 2 },
        { label: 'C', value: 3 },
        { label: 'D', value: 4 },
      ])
      queryClient.invalidateQueries({
        queryKey: tierlistQueries.user(userId).queryKey,
      })
    },
    onError: () => {
      toastManager.add({
        title: 'Error',
        description: 'Failed to create tierlist',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const genreLabels = selectedGenres
      .map((id) => genreIdToLabel.get(id))
      .filter((label): label is string => label !== undefined)

    createMutation.mutate({
      data: {
        userId,
        title,
        watchDateFrom: watchDateFrom || undefined,
        watchDateTo: watchDateTo || undefined,
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
        <DialogBackdrop />
        <DialogPopup className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            <div>
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                Create New Tierlist
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Set up your tierlist parameters
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                required
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g., Best Movies of 2025"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  From Date
                </label>
                <Input
                  type="date"
                  value={watchDateFrom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setWatchDateFrom(e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  To Date
                </label>
                <Input
                  type="date"
                  value={watchDateTo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setWatchDateTo(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <GenreFilter
                selectedGenres={selectedGenres}
                onGenresChange={setSelectedGenres}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                  Tiers
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTier}
                  className="h-8"
                >
                  <Plus className="mr-1.5 h-3 w-3" />
                  Add
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {tiers.map((tier, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <Input
                      value={tier.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateTierLabel(index, e.target.value)
                      }
                      placeholder="Tier Name"
                      className="flex-1 h-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTier(index)}
                      disabled={tiers.length <= 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Tierlist'}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  )
}
