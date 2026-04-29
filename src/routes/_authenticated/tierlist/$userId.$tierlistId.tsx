import { TierlistDetailSkeleton } from '@/components/tierlist/tierlist-detail-skeleton'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { tierlistQueries } from '@/lib/react-query/queries/tierlists'
import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const TierlistContent = lazy(() =>
  import('@/components/tierlist/tierlist-content').then((m) => ({
    default: m.TierlistContent,
  })),
)

export const Route = createFileRoute(
  '/_authenticated/tierlist/$userId/$tierlistId',
)({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(tierlistQueries.single(params.tierlistId))
    context.queryClient.prefetchQuery(movieQueries.allWatched())
  },
})

function RouteComponent() {
  const { tierlistId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const isOwner = user?.userId === Route.useParams().userId

  return (
    <Suspense fallback={<TierlistDetailSkeleton />}>
      <TierlistContent
        tierlistId={tierlistId}
        isOwner={isOwner}
      />
    </Suspense>
  )
}
