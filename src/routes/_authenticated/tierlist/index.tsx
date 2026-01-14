import { PageTitleBar } from '@/components/page-titlebar'
import Avatar from '@/components/ui/avatar'
import { tierlistQueries } from '@/lib/react-query/queries/tierlists'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Film, Layers, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/tierlist/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(tierlistQueries.all())
  },
})

function RouteComponent() {
  const { data: usersWithTierlists } = useSuspenseQuery(tierlistQueries.all())

  const totalTierlists = usersWithTierlists.reduce(
    (acc, user) => acc + user.tierlists.length,
    0,
  )
  const totalMovies = usersWithTierlists.reduce(
    (acc, user) =>
      acc +
      user.tierlists.reduce(
        (tierAcc, tierlist) =>
          tierAcc +
          tierlist.tiers.reduce(
            (movAcc, tier) => movAcc + (tier.moviesOnTiers?.length || 0),
            0,
          ),
        0,
      ),
    0,
  )

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <PageTitleBar
            title="Community Tierlists"
            description="Explore and discover how the community ranks their favorite movies."
          />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {usersWithTierlists.map((user, index) => (
            <div
              key={user.id}
              className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative bg-gradient-to-br from-card via-card to-card/80 rounded-2xl border border-border/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-primary/40 hover:shadow-primary/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <Link
                  to="/tierlist/$userId"
                  params={{ userId: user.id }}
                  className="relative block p-6 border-b border-border/40 hover:bg-muted/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative ring-2 ring-border/50 group-hover:ring-primary/30 rounded-full transition-all duration-300">
                        <Avatar
                          src={user.image}
                          alt={user.name}
                          name={user.name}
                          size={56}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 border-2 border-background flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-[11px] font-bold text-primary-foreground">
                          {user.tierlists.length}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-lg truncate group-hover:text-primary transition-colors duration-300">
                        {user.name}
                      </h2>
                      <p className="text-sm text-muted-foreground font-medium">
                        {user.tierlists.length}{' '}
                        {user.tierlists.length === 1 ? 'tierlist' : 'tierlists'}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </Link>
                <div className="p-4 space-y-2">
                  {user.tierlists.slice(0, 3).map((tierlist, tierIndex) => {
                    const movieCount = tierlist.tiers.reduce(
                      (acc, tier) => acc + (tier.moviesOnTiers?.length || 0),
                      0,
                    )
                    const tierCount = tierlist.tiers.length

                    return (
                      <Link
                        key={tierlist.id}
                        to="/tierlist/$userId/$tierlistId"
                        params={{ userId: user.id, tierlistId: tierlist.id }}
                        className="group/item relative flex items-center gap-3 p-4 rounded-xl hover:bg-muted/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                      >
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full bg-gradient-to-b from-primary/40 via-primary/60 to-purple-500/40 group-hover/item:from-primary group-hover/item:via-primary group-hover/item:to-purple-500 group-hover/item:h-14 transition-all duration-300" />

                        <div className="flex-1 min-w-0 pl-3">
                          <span className="font-semibold text-sm block truncate group-hover/item:text-primary transition-colors duration-200">
                            {tierlist.title || 'Untitled'}
                          </span>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Layers className="w-3.5 h-3.5" />
                              <span>{tierCount} tiers</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <Film className="w-3.5 h-3.5" />
                              <span>{movieCount} movies</span>
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 -translate-x-1 group-hover/item:translate-x-0 transition-all duration-300" />
                      </Link>
                    )
                  })}
                  {user.tierlists.length > 3 && (
                    <Link
                      to="/tierlist/$userId"
                      params={{ userId: user.id }}
                      className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>View {user.tierlists.length - 3} more</span>
                    </Link>
                  )}
                  {user.tierlists.length === 0 && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
                        <Layers className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        No tierlists yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {usersWithTierlists.length === 0 && (
          <div className="text-center py-24">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/50 border border-border">
                <Layers className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No tierlists found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Be the first to create a tierlist and share your movie rankings
              with the community!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
