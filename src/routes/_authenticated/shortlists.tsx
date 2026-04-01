import { createFileRoute, Link } from '@tanstack/react-router'
import { Suspense } from 'react'

import { PageTitleBar } from '@/components/page-titlebar'
import { ShortlistOverviewGrid } from '@/components/shortlists/shortlist-overview-grid'
import { ShortlistsSkeleton } from '@/components/shortlists/shortlists-skeleton'
import { buttonVariants } from '@/components/ui/button'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { cn } from '@/lib/utils'
import { Dices } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/shortlists')({
  loader: async ({ context }) => {
    context.queryClient.prefetchQuery(shortlistQueries.all())
  },
  component: ShortlistsPage,
})

function ShortlistsPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-2 md:pl-[72px]">
      <PageTitleBar
        title="Shortlists"
        description="See what movies your friends have shortlisted for the next raffle."
        actions={
          <Link
            to="/raffle"
            className={cn(
              buttonVariants({ variant: 'primary', size: 'sm' }),
              'rounded-full gap-2',
            )}
          >
            <Dices className="w-4 h-4" />
            Go to Raffle
          </Link>
        }
      />
      <Suspense fallback={<ShortlistsSkeleton />}>
        <ShortlistOverviewGrid />
      </Suspense>
    </div>
  )
}
