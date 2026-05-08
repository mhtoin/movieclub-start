import { Toast } from '@base-ui/react/toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import confetti from 'canvas-confetti'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock,
  Film,
  Infinity as InfinityIcon,
  Plus,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
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

const easeOut = [0.22, 1, 0.36, 1] as const

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 28 : -28,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -28 : 28,
    opacity: 0,
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
}

const TIER_SWATCHES = [
  { bg: 'oklch(0.82 0.12 82)', text: '#4a2e08', letter: '#7a4a10' },
  { bg: 'oklch(0.78 0.12 55)', text: '#4a2208', letter: '#8a3a10' },
  { bg: 'oklch(0.85 0.11 95)', text: '#4a3a08', letter: '#8a6a10' },
  { bg: 'oklch(0.82 0.10 145)', text: '#1e3a18', letter: '#2e6a28' },
  { bg: 'oklch(0.76 0.10 25)', text: '#4a1212', letter: '#8a2222' },
  { bg: 'oklch(0.78 0.08 280)', text: '#2e1e4a', letter: '#4e2e7a' },
  { bg: 'oklch(0.80 0.07 200)', text: '#1e2e4a', letter: '#2e4e7a' },
]

export function CreateTierlistDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)

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
      const currentData = queryClient.getQueryData(
        tierlistQueries.userSummary(userId).queryKey,
      )
      const wasEmpty =
        !currentData || (Array.isArray(currentData) && currentData.length === 0)

      toastManager.add({
        title: 'Premiere ready',
        description: 'Your tierlist is live',
        type: 'success',
      })
      handleClose()
      queryClient.invalidateQueries({
        queryKey: tierlistQueries.userSummary(userId).queryKey,
      })

      if (wasEmpty) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E8B931', '#C0392B', '#F39C12', '#27AE60'],
          disableForReducedMotion: true,
        })
      }
    },
    onError: () => {
      toastManager.add({
        title: 'Error',
        description: 'Failed to create tierlist',
        type: 'error',
      })
    },
  })

  const handleClose = () => {
    setOpen(false)
    setStep(1)
    setDirection(1)
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

  const goToStep = (target: number) => {
    setDirection(target > step ? 1 : -1)
    setStep(target)
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
        <DialogPopup className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 max-w-[calc(100vw-2rem)] w-[580px]">
          <div className="relative overflow-hidden rounded-t-lg">
            <div className="flex items-center justify-between px-8 pt-8 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clapperboard className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    className="text-xl font-bold tracking-tight text-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    New Tierlist
                  </h2>
                  <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-0.5">
                    {step === 1
                      ? 'Scene 1 — The Program'
                      : 'Scene 2 — The Rating Board'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-9 w-9 rounded-xl"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div className="flex items-center gap-3 px-8 pb-6">
              <Button
                type="button"
                variant={step === 1 ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => goToStep(1)}
                className={`rounded-full h-auto px-3 py-1 text-xs font-semibold gap-2 ${
                  step !== 1 && 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/15 text-[10px] font-bold">
                  1
                </span>
                Program
              </Button>
              <div className="flex-1 h-px bg-border/60" />
              <Button
                type="button"
                variant={step === 2 ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => title.trim() && goToStep(2)}
                disabled={!title.trim()}
                className={`rounded-full h-auto px-3 py-1 text-xs font-semibold gap-2 ${
                  step !== 2 && 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/15 text-[10px] font-bold">
                  2
                </span>
                Tiers
              </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: 'var(--dialog-background)',
                    marginBottom: '-3px',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit}>
              <div className="relative min-h-[380px]">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  {step === 1 ? (
                    <StepOne
                      key="step1"
                      direction={direction}
                      title={title}
                      setTitle={setTitle}
                      datePreset={datePreset}
                      handleDatePreset={handleDatePreset}
                      fromYear={fromYear}
                      toYear={toYear}
                      handleFromYearChange={handleFromYearChange}
                      handleToYearChange={handleToYearChange}
                      genresData={genresData}
                      selectedGenres={selectedGenres}
                      setSelectedGenres={setSelectedGenres}
                      onNext={() => goToStep(2)}
                    />
                  ) : (
                    <StepTwo
                      key="step2"
                      direction={direction}
                      tiers={tiers}
                      updateTierLabel={updateTierLabel}
                      removeTier={removeTier}
                      addTier={addTier}
                      onBack={() => goToStep(1)}
                      isPending={createMutation.isPending}
                    />
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  )
}

function StepOne({
  direction,
  title,
  setTitle,
  datePreset,
  handleDatePreset,
  fromYear,
  toYear,
  handleFromYearChange,
  handleToYearChange,
  genresData,
  selectedGenres,
  setSelectedGenres,
  onNext,
}: {
  direction: number
  title: string
  setTitle: (v: string) => void
  datePreset: string | null
  handleDatePreset: (preset: string) => void
  fromYear: string
  toYear: string
  handleFromYearChange: (v: string | null) => void
  handleToYearChange: (v: string | null) => void
  genresData: Array<{ value: string; label: string }>
  selectedGenres: Array<string>
  setSelectedGenres: (v: Array<string>) => void
  onNext: () => void
}) {
  const yearOptions = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(
        (year) => String(year),
      ),
    [],
  )

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: easeOut }}
      className="space-y-7"
    >
      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        <motion.div variants={staggerItem} className="space-y-3">
          <label
            htmlFor="tierlist-title"
            className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            <Star className="h-4 w-4" />
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
            placeholder="e.g. Best Horror of the 90s"
            className="h-12 text-base"
            maxLength={100}
            style={{
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.01em',
            }}
          />
        </motion.div>
        <motion.div variants={staggerItem} className="space-y-3 pt-4">
          <label className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <CalendarRange className="h-4 w-4" />
            Time Period
          </label>
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
                  }`}>
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span className="text-sm font-medium">{preset.label}</span>
                  {active && (
                    <motion.div
                      layoutId="time-preset-glow"
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
              <motion.div
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div variants={staggerItem} className="space-y-3 pt-4">
          <label className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Film className="h-4 w-4" />
            Genres
          </label>
          <div className="flex flex-wrap gap-2.5">
            {genresData.map((genre) => {
              const active = selectedGenres.includes(genre.value)
              return (
                <Button
                  key={genre.value}
                  type="button"
                  variant={active ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    if (active) {
                      setSelectedGenres(
                        selectedGenres.filter((g) => g !== genre.value),
                      )
                    } else {
                      setSelectedGenres([...selectedGenres, genre.value])
                    }
                  }}
                  className={`rounded-full h-auto px-3.5 py-1.5 text-xs font-semibold tracking-wide ${
                    !active &&
                    'bg-muted text-foreground hover:bg-primary/[0.05] hover:border-primary/30 border border-border'
                  }`}
                >
                  {genre.label}
                </Button>
              )
            })}
          </div>
        </motion.div>
        <motion.div variants={staggerItem} className="flex justify-end pt-4">
          <Button
            type="button"
            onClick={onNext}
            disabled={!title.trim()}
            className="gap-2 h-11 px-5"
          >
            Next Scene
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function StepTwo({
  direction,
  tiers,
  updateTierLabel,
  removeTier,
  addTier,
  onBack,
  isPending,
}: {
  direction: number
  tiers: Array<{ label: string; value: number }>
  updateTierLabel: (index: number, label: string) => void
  removeTier: (index: number) => void
  addTier: () => void
  onBack: () => void
  isPending: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const prevTierCount = useRef(tiers.length)
  useEffect(() => {
    if (tiers.length > prevTierCount.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    prevTierCount.current = tiers.length
  }, [tiers.length])

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: easeOut }}
      className="space-y-6"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div
          variants={staggerItem}
          className="flex items-center gap-2.5"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Customize your scoring board
          </p>
        </motion.div>

        <motion.div
          ref={scrollRef}
          variants={staggerItem}
          className="space-y-3 max-h-[280px] overflow-y-auto pr-1 no-scrollbar"
        >
          <AnimatePresence initial={false}>
            {tiers.map((tier, index) => {
              const swatch = TIER_SWATCHES[index % TIER_SWATCHES.length]
              return (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className="flex items-center gap-3 group"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold shadow-sm"
                    style={{
                      background: swatch.bg,
                      color: swatch.letter,
                      fontFamily: "'Bebas Neue', sans-serif",
                      letterSpacing: '0.04em',
                      fontSize: '1.1rem',
                    }}
                  >
                    {tier.label.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 relative">
                    <Input
                      value={tier.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateTierLabel(index, e.target.value)
                      }
                      className="h-9 pr-8 text-sm font-medium"
                      maxLength={30}
                      style={{
                        background: swatch.bg,
                        color: swatch.text,
                        borderColor: 'transparent',
                      }}
                    />
                    <span
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-40 pointer-events-none"
                      style={{ color: swatch.text }}
                    >
                      #{index + 1}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTier(index)}
                    disabled={tiers.length <= 1}
                    className="h-8 w-8 shrink-0 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive disabled:opacity-0"
                    title="Remove tier"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
        <motion.div variants={staggerItem}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addTier}
            className="w-full rounded-xl h-auto py-3 text-xs font-semibold text-foreground border border-dashed border-border bg-muted hover:border-primary/40 hover:bg-primary/[0.05]"
          >
            <Plus className="h-4 w-4" />
            Add Tier
          </Button>
        </motion.div>
        <motion.div
          variants={staggerItem}
          className="flex items-center justify-between pt-4 border-t border-border/40"
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="gap-2 h-10 text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 h-10 px-5"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Create Tierlist
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
