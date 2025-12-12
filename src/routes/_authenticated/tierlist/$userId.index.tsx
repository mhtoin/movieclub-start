import { GenreFilter } from '@/components/discover/genre-filter'
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
import { Toast } from '@base-ui/react/toast'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'

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

  return (
    <div className="container mx-auto max-w-5xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tierlists</h1>
        {isOwner && <CreateTierlistDialog userId={userId} />}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tierlists.map((list) => (
          <div
            key={list.id}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
          >
            <div className="p-6">
              <h3 className="mb-2 text-xl font-semibold">{list.title}</h3>
              <div className="mb-4 flex flex-wrap gap-2">
                {list.genres?.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {list.watchDateFrom && (
                  <div>
                    From: {new Date(list.watchDateFrom).toLocaleDateString()}
                  </div>
                )}
                {list.watchDateTo && (
                  <div>
                    To: {new Date(list.watchDateTo).toLocaleDateString()}
                  </div>
                )}
                <div>{list.tiers.length} Tiers</div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t bg-muted/50 p-4">
              <Link
                to="/tierlist/$userId/$tierlistId"
                params={{ userId, tierlistId: list.id }}
                className="text-sm font-medium hover:underline"
              >
                View Details
              </Link>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (
                      confirm('Are you sure you want to delete this tierlist?')
                    ) {
                      deleteMutation.mutate({ data: { id: list.id } })
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {tierlists.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold">No tierlists found</h3>
            <p className="text-muted-foreground">
              {isOwner
                ? "You haven't created any tierlists yet."
                : "This user hasn't created any tierlists yet."}
            </p>
            {isOwner && (
              <div className="mt-4">
                <CreateTierlistDialog userId={userId} />
              </div>
            )}
          </div>
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
    createMutation.mutate({
      data: {
        userId,
        title,
        watchDateFrom: watchDateFrom || undefined,
        watchDateTo: watchDateTo || undefined,
        genres: selectedGenres,
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Tierlist
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              Create New Tierlist
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                required
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTitle(e.target.value)
                }
                placeholder="My Awesome Tierlist"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Input
                  type="date"
                  value={watchDateFrom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setWatchDateFrom(e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Tiers</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTier}
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Add Tier
                </Button>
              </div>
              <div className="space-y-2">
                {tiers.map((tier, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <Input
                      value={tier.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateTierLabel(index, e.target.value)
                      }
                      placeholder="Tier Name"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTier(index)}
                      disabled={tiers.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
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
