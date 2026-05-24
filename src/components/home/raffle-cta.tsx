import { memo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { m, useReducedMotion } from 'framer-motion'
import { ArrowRight, Dices } from 'lucide-react'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'

interface RaffleCTAProps {
  readyCount: number
  totalMembers: number
}

export const RaffleCTA = memo(function RaffleCTA({
  readyCount,
  totalMembers,
}: RaffleCTAProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="max-w-xl">
      <Link
        to="/raffle"
        className="group flex items-center gap-6 rounded-2xl border border-primary/15 bg-[color-mix(in_oklch,var(--card)_97%,var(--primary)_3%)] px-7 py-6 transition-all
        hover:border-primary/30 hover:shadow-md hover:shadow-primary/[0.04] hover:bg-[color-mix(in_oklch,var(--card)_94%,var(--primary)_6%)]"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/[0.08] transition-colors group-hover:bg-primary/[0.12] flex-shrink-0">
          <m.div
            className="text-primary"
            whileHover={shouldReduceMotion ? undefined : { rotate: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          >
            <Dices className="size-7" />
          </m.div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-cinema-caps text-xl md:text-2xl tracking-wide text-foreground">
            Run the Raffle
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {readyCount} of {totalMembers} members ready
          </p>
        </div>
        <ArrowRight className="size-6 text-primary/50 transition-all group-hover:translate-x-1 group-hover:text-primary flex-shrink-0" />
      </Link>
    </div>
  )
})

export function RaffleCTASkeleton() {
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-6 rounded-2xl border border-border/10 bg-muted/20 px-7 py-6">
        <div className="size-14 rounded-full animate-pulse bg-muted flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="size-6 animate-pulse rounded bg-muted flex-shrink-0" />
      </div>
    </div>
  )
}

export function RaffleCTASuspense() {
  const { data: allShortlists = [] } = useSuspenseQuery(shortlistQueries.all())
  const readyCount = allShortlists.filter(
    (s) => s.isReady && s.participating,
  ).length

  return (
    <RaffleCTA readyCount={readyCount} totalMembers={allShortlists.length} />
  )
}
