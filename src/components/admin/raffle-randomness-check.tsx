import { startTransition, useState } from 'react'
import { BarChart3, CheckCircle2, Dices, Info } from 'lucide-react'
import type { ShortlistWithUserMovies } from '@/db/schema'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'

type SimulationResult = {
  runs: number
  counts: Record<string, number>
  memberCounts: Record<string, number>
}

const DEFAULT_RUNS = 10_000
const MAX_RUNS = 100_000

function getRandomIndex(
  length: number,
  randomValues: Uint32Array,
  index: number,
) {
  return Math.floor((randomValues[index] / (0xffffffff + 1)) * length)
}

export function RaffleRandomnessCheck({
  shortlists,
}: {
  shortlists: Array<ShortlistWithUserMovies>
}) {
  const [runsInput, setRunsInput] = useState(String(DEFAULT_RUNS))
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const eligibleEntries = shortlists.flatMap((shortlist) =>
    shortlist.participating && shortlist.isReady
      ? shortlist.movies.map((movie) => ({
          movieId: movie.id,
          title: movie.title,
          userId: shortlist.user.id,
          userName: shortlist.user.name,
        }))
      : [],
  )

  const memberNames = new Map(
    eligibleEntries.map((entry) => [entry.userId, entry.userName]),
  )
  const totalRuns = result?.runs ?? 0
  const expectedShare =
    eligibleEntries.length > 0 ? 100 / eligibleEntries.length : 0
  const distribution = eligibleEntries
    .map((entry) => ({
      ...entry,
      count: result?.counts[entry.movieId] ?? 0,
      share:
        totalRuns > 0
          ? ((result?.counts[entry.movieId] ?? 0) / totalRuns) * 100
          : 0,
    }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
  const memberDistribution = Array.from(memberNames, ([userId, name]) => ({
    userId,
    name,
    count: result?.memberCounts[userId] ?? 0,
    share:
      totalRuns > 0
        ? ((result?.memberCounts[userId] ?? 0) / totalRuns) * 100
        : 0,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  const largestDeviation = distribution.reduce(
    (largest, entry) =>
      Math.max(largest, Math.abs(entry.share - expectedShare)),
    0,
  )

  const runSimulation = () => {
    const runs = Math.min(
      MAX_RUNS,
      Math.max(1, Math.round(Number(runsInput) || DEFAULT_RUNS)),
    )
    setRunsInput(String(runs))
    if (eligibleEntries.length === 0) return

    setIsRunning(true)
    startTransition(() => {
      const counts: Record<string, number> = {}
      const memberCounts: Record<string, number> = {}
      const randomValues = new Uint32Array(runs)

      // Browsers cap a single getRandomValues call at 65,536 bytes.
      for (let offset = 0; offset < runs; offset += 16_384) {
        crypto.getRandomValues(randomValues.subarray(offset, offset + 16_384))
      }

      for (let index = 0; index < runs; index += 1) {
        const winner =
          eligibleEntries[
            getRandomIndex(eligibleEntries.length, randomValues, index)
          ]
        counts[winner.movieId] = (counts[winner.movieId] ?? 0) + 1
        memberCounts[winner.userId] = (memberCounts[winner.userId] ?? 0) + 1
      }

      setResult({ runs, counts, memberCounts })
      setIsRunning(false)
    })
  }

  return (
    <section className="rounded-2xl border border-border/40 bg-card/50 p-5 shadow-sm backdrop-blur-sm md:p-6">
      <div className="mb-7 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Dices className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Raffle randomness check
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Replay the live draw algorithm against the current ready pool. Every
            eligible movie should converge on the same share over many runs.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Eligible movies" value={eligibleEntries.length} />
          <Metric label="Eligible members" value={memberNames.size} />
          <Metric
            label="Expected / movie"
            value={`${expectedShare.toFixed(2)}%`}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="raffle-runs"
            >
              Simulation runs
            </label>
            <Input
              id="raffle-runs"
              type="number"
              min={1}
              max={MAX_RUNS}
              step={1000}
              value={runsInput}
              onChange={(event) => setRunsInput(event.target.value)}
              className="w-full sm:w-36"
            />
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={runSimulation}
            loading={isRunning}
            disabled={eligibleEntries.length === 0}
          >
            <BarChart3 className="size-4" />
            Run simulation
          </Button>
        </div>
      </div>

      {eligibleEntries.length === 0 ? (
        <div className="mt-7 flex items-start gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          Mark at least one participating shortlist as ready to create a
          simulation pool.
        </div>
      ) : result ? (
        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border/30 py-4 text-sm">
            <span className="text-muted-foreground">
              Based on{' '}
              <strong className="text-foreground">
                {result.runs.toLocaleString()}
              </strong>{' '}
              simulated draws
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              Largest movie deviation: {largestDeviation.toFixed(2)} pts
            </span>
          </div>

          <DistributionTable
            title="By movie"
            expectedLabel={`${expectedShare.toFixed(2)}% expected each`}
            entries={distribution}
          />
          <DistributionTable
            title="By member"
            expectedLabel="Members with more movies have a larger expected share"
            entries={memberDistribution.map((entry) => ({
              ...entry,
              movieId: entry.userId,
              title: entry.name,
              userId: entry.userId,
              userName: entry.name,
            }))}
          />
        </div>
      ) : (
        <div className="mt-7 rounded-xl border border-dashed border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
          Run a simulation to see how often each movie and member wins.
        </div>
      )}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function DistributionTable({
  title,
  expectedLabel,
  entries,
}: {
  title: string
  expectedLabel: string
  entries: Array<{
    movieId: string
    title: string
    userId: string
    userName: string
    count: number
    share: number
  }>
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{expectedLabel}</span>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.movieId}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1"
          >
            <div className="flex min-w-0 items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium">{entry.title}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {entry.count.toLocaleString()} - {entry.share.toFixed(2)}%
              </span>
            </div>
            <div className="row-span-2 flex items-center text-xs text-muted-foreground">
              {title === 'By movie' ? entry.userName : ''}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{
                  width: `${Math.max(entry.share, entry.count > 0 ? 0.5 : 0)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
