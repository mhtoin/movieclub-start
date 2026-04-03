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

  return (
    <div className="container mx-auto px-4 py-6 md:pl-[72px]">
      <PageTitleBar
        title={user?.userId === userId ? 'Your Tierlists' : 'Tierlists'}
        description={
          user?.userId === userId
            ? 'Manage and organize your movie rankings'
            : `Browse ${user?.name || 'this user'}'s movie rankings`
        }
        actions={
          user?.userId === userId && <CreateTierlistDialog userId={userId} />
        }
      />

      <Suspense fallback={<UserTierlistsSkeleton />}>
        <UserTierlistsContent userId={userId} />
      </Suspense>
    </div>
  )
}

function UserTierlistsContent({ userId }: { userId: string }) {
  const { data: tierlists } = useSuspenseQuery(
    tierlistQueries.userSummary(userId),
  )
  const isOwner = true

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
    </div>
  )
}
