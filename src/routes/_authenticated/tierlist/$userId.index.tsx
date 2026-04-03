import { PageTitleBar } from '@/components/page-titlebar'
import { CreateTierlistDialog } from '@/components/tierlist/create-tierlist-dialog'
import { UserTierlistsEmptyState } from '@/components/tierlist/user-tierlists-empty-state'
import { FeaturedTierlist } from '@/components/tierlist/featured-tierlist'
import { TierlistCard } from '@/components/tierlist/tierlist-card'
import { UserTierlistsSkeleton } from '@/components/tierlist/user-tierlists-skeleton'
import { tierlistQueries } from '@/lib/react-query/queries/tierlists'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/_authenticated/tierlist/$userId/')({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(
      tierlistQueries.userSummary(params.userId),
    )
  },
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const isOwner = user?.userId === userId

  return (
    <div className="container mx-auto py-5 md:pl-[72px]">
      <PageTitleBar
        title={isOwner ? 'Your Tierlists' : 'Tierlists'}
        description={
          isOwner
            ? 'Manage and organize your movie rankings'
            : `Browse ${user?.name || 'this user'}'s movie rankings`
        }
        actions={isOwner && <CreateTierlistDialog userId={userId} />}
      />

      <Suspense fallback={<UserTierlistsSkeleton />}>
        <UserTierlistsContent userId={userId} isOwner={isOwner} />
      </Suspense>
    </div>
  )
}

function UserTierlistsContent({
  userId,
  isOwner,
}: {
  userId: string
  isOwner: boolean
}) {
  const { data: tierlists } = useSuspenseQuery(
    tierlistQueries.userSummary(userId),
  )

  if (tierlists.length === 0) {
    return <UserTierlistsEmptyState isOwner={isOwner} userId={userId} />
  }

  return (
    <div className="max-w-6xl mx-auto">
      <FeaturedTierlist
        tierlist={tierlists[0]}
        userId={userId}
        isOwner={isOwner}
      />
      {tierlists.length > 1 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-foreground mb-5">
            All Tierlists
          </h2>
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
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
    </div>
  )
}
