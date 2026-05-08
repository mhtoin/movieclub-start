import { PageTitleBar } from '@/components/page-titlebar'
import { CreateTierlistDialog } from '@/components/tierlist/create-tierlist-dialog'
import { UserTierlistsEmptyState } from '@/components/tierlist/user-tierlists-empty-state'
import { FeaturedTierlist } from '@/components/tierlist/featured-tierlist'
import { PolaroidTierlistCard } from '@/components/tierlist/polaroid-tierlist-card'
import { UserTierlistsSkeleton } from '@/components/tierlist/user-tierlists-skeleton'
import { tierlistQueries } from '@/lib/react-query/queries/tierlists'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
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
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <FeaturedTierlist
          tierlist={tierlists[0]}
          userId={userId}
          isOwner={isOwner}
        />
      </motion.div>

      {tierlists.length > 1 && (
        <motion.div
          className="mt-10 md:mt-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-muted/60 via-muted/40 to-muted/20 p-6 sm:p-8 md:p-10 shadow-inner">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  'radial-gradient(ellipse 80% 50% at 50% 0%, oklch(from var(--primary) l c h / 0.06), transparent 60%)',
              }}
            />

            <motion.h2
              className="relative mb-8 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground md:mb-10"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              All Tierlists
            </motion.h2>

            <div className="relative grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 md:gap-10">
              {tierlists.slice(1).map((list, i) => (
                <PolaroidTierlistCard
                  key={list.id}
                  tierlist={list}
                  userId={userId}
                  isOwner={isOwner}
                  index={i}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
