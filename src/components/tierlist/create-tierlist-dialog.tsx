import { Toast } from '@base-ui/react/toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ChevronRight, Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
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
  SelectItem,
  SelectPopup,
  SelectRoot,
  SelectTrigger,
} from '@/components/ui/select'
import { createTierlist } from '@/lib/react-query/mutations/tierlists'
import { tierlistQueries } from '@/lib/react-query/queries/tierlists'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'

export function CreateTierlistDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [datePreset, setDatePreset] = useState<string | null>(null)
  const [watchDateFrom, setWatchDateFrom] = useState<Date | undefined>(
    undefined,
  )
  const [watchDateTo, setWatchDateTo] = useState<Date | undefined>(undefined)
  const [fromYear, setFromYear] = useState<string>('')
  const [toYear, setToYear] = useState<string>('')
  const [selectedGenres, setSelectedGenres] = useState<Array<string>>([])
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
        queryKey: tierlistQueries.userSummary(userId).queryKey,
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
    setFromYear('')
    setToYear('')
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
                className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
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
                    <label
                      htmlFor="tierlist-title"
                      className="text-sm font-medium"
                    >
                      Title
                    </label>
                    <Input
                      id="tierlist-title"
                      required
                      autoFocus
                      value={title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTitle(e.target.value)
                      }
                      placeholder="My Movie Rankings"
                      className="h-11"
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Period</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'this-year', label: 'This Year' },
                        { value: 'last-year', label: 'Last Year' },
                        { value: 'custom-range', label: 'Custom Range' },
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
                    {datePreset === 'custom-range' && (
                      <div className="flex items-center gap-2 mt-2">
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
                            {Array.from(
                              { length: 30 },
                              (_, i) => new Date().getFullYear() - i,
                            ).map((year) => (
                              <SelectItem key={year} value={String(year)}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectPopup>
                        </SelectRoot>
                        <span className="text-muted-foreground text-sm">
                          to
                        </span>
                        <SelectRoot
                          value={toYear}
                          onValueChange={handleToYearChange}
                        >
                          <SelectTrigger
                            size="sm"
                            placeholder="To year"
                            className="flex-1"
                          />
                          <SelectPopup positionerClassName="z-[120]">
                            {Array.from(
                              { length: 30 },
                              (_, i) => new Date().getFullYear() - i,
                            ).map((year) => (
                              <SelectItem key={year} value={String(year)}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectPopup>
                        </SelectRoot>
                      </div>
                    )}
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
                        maxLength={30}
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
