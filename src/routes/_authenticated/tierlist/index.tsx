import { PageTitleBar } from '@/components/page-titlebar'
import { TierlistIndexSkeleton } from '@/components/tierlist/tierlist-index-skeleton'
import Avatar from '@/components/ui/avatar'
import {
  tierlistQueries,
  type TierlistPreview,
  type UserTierlistSummary,
} from '@/lib/react-query/queries/tierlists'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Film, Layers, Plus } from 'lucide-react'
import { Suspense } from 'react'

const USER_COLORS = [
  { hue: 48 },
  { hue: 220 },
  { hue: 145 },
  { hue: 340 },
  { hue: 30 },
  { hue: 280 },
  { hue: 180 },
  { hue: 0 },
]

function getUserColor(userId: string): {
  bg: string
  border: string
  accent: string
} {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i)
  }
  const index = Math.abs(hash) % USER_COLORS.length
  const { hue } = USER_COLORS[index]

  return {
    bg: `oklch(0.95 0.04 ${hue} / 0.15)`,
    border: `oklch(0.7 0.1 ${hue})`,
    accent: `oklch(0.65 0.12 ${hue})`,
  }
}

export const Route = createFileRoute('/_authenticated/tierlist/')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(tierlistQueries.index())
    return { currentUserId: context.user?.userId }
  },
})

function RouteComponent() {
  const { currentUserId } = Route.useLoaderData()

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pl-[72px]">
          <PageTitleBar
            title="Community Tierlists"
            description="Explore and discover how the community ranks their favorite movies."
            actions={<CreateTierlistButton currentUserId={currentUserId} />}
          />
        </div>
      </div>
      <Suspense fallback={<TierlistIndexSkeleton />}>
        <TierlistContent />
      </Suspense>
    </div>
  )
}

function TierlistContent() {
  const { data: usersWithTierlists } = useSuspenseQuery(tierlistQueries.index())

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pl-[72px]">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {(usersWithTierlists as UserTierlistSummary[]).map((user) => (
          <UserTierlistCard key={user.id} user={user} />
        ))}
      </div>

      {usersWithTierlists.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No tierlists yet. Create the first one!
          </p>
        </div>
      )}
    </div>
  )
}

function CreateTierlistButton({ currentUserId }: { currentUserId?: string }) {
  const href = currentUserId ? `/tierlist/${currentUserId}` : '/dashboard'

  return (
    <Link
      to={href}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <Plus className="w-4 h-4" />
      <span>New Tierlist</span>
    </Link>
  )
}

function UserTierlistCard({ user }: { user: UserTierlistSummary }) {
  const colors = getUserColor(user.id)
  const hasMultipleTierlists = user.tierlists.length > 1

  return (
    <div
      className="break-inside-avoid animate-in fade-in duration-500 fill-mode-both"
      style={{
        borderLeft: `3px solid ${colors.border}`,
        paddingLeft: '0.75rem',
      }}
    >
      <Link
        to="/tierlist/$userId"
        params={{ userId: user.id }}
        className="block group"
      >
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            src={user.image ?? ''}
            alt={user.name ?? ''}
            name={user.name ?? 'User'}
            size={40}
          />
          <div className="min-w-0">
            <h2 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {user.name ?? 'Unknown User'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {user.tierlists.length}{' '}
              {user.tierlists.length === 1 ? 'tierlist' : 'tierlists'}
            </p>
          </div>
        </div>
      </Link>

      <div className="space-y-4">
        {user.tierlists
          .slice(0, hasMultipleTierlists ? 3 : 4)
          .map((tierlist) => (
            <TierlistCard
              key={tierlist.id}
              tierlist={tierlist}
              userId={user.id}
              userColor={colors}
            />
          ))}
      </div>

      {user.tierlists.length > 3 && (
        <Link
          to="/tierlist/$userId"
          params={{ userId: user.id }}
          className="flex items-center justify-center gap-2 py-3 mt-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
        >
          <span>View {user.tierlists.length - 3} more</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

function TierlistCard({
  tierlist,
  userId,
  userColor,
}: {
  tierlist: TierlistPreview
  userId: string
  userColor: { bg: string; border: string; accent: string }
}) {
  const movieCount = tierlist.movieCount
  const previewPosters = tierlist.posterPaths

  const tags = getTierlistTags(tierlist)

  return (
    <Link
      to="/tierlist/$userId/$tierlistId"
      params={{ userId, tierlistId: tierlist.id }}
      className="block group/paper relative bg-card border border-border/60 rounded-xl overflow-hidden hover:border-border transition-colors"
    >
      {previewPosters.length > 0 && (
        <div className="relative h-32 overflow-hidden">
          <div className="flex h-full">
            {previewPosters.slice(0, 4).map((path, i) => (
              <div
                key={i}
                className="flex-1 overflow-hidden"
                style={{ marginLeft: i > 0 ? '-10%' : 0 }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w200${path}`}
                  alt=""
                  className="w-full h-full object-cover object-top"
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm text-foreground truncate group-hover/paper:text-primary transition-colors">
            {tierlist.title || 'Untitled Tierlist'}
          </h3>
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover/paper:opacity-100 -translate-x-1 group-hover/paper:translate-x-0 transition-all shrink-0 mt-0.5" />
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full"
                style={{
                  backgroundColor: userColor.bg,
                  color: userColor.accent,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            <span>{tierlist.tierCount} tiers</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Film className="w-3 h-3" />
            <span>{movieCount} movies</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

function getTierlistTags(tierlist: TierlistPreview): string[] {
  const tags: string[] = []

  if (tierlist.genres && tierlist.genres.length > 0) {
    tags.push(...tierlist.genres.slice(0, 2))
  }

  if (tierlist.watchDateFrom || tierlist.watchDateTo) {
    const fromYear = tierlist.watchDateFrom
      ? new Date(tierlist.watchDateFrom).getFullYear()
      : null
    const toYear = tierlist.watchDateTo
      ? new Date(tierlist.watchDateTo).getFullYear()
      : null

    if (fromYear && toYear && fromYear !== toYear) {
      tags.push(`${fromYear}–${toYear}`)
    } else if (fromYear) {
      tags.push(`${fromYear}+`)
    } else if (toYear) {
      tags.push(`pre-${toYear}`)
    }
  }

  return tags
}
