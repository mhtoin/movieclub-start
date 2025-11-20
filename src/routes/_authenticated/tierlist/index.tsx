import Avatar from '@/components/ui/avatar'
import { tierlistQueries } from '@/lib/react-query/queries/tierlists'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tierlist/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(tierlistQueries.all())
  },
})

function getUserColor(index: number) {
  return `hsl(${(index * 137.5) % 360}, 70%, 50%)`
}

function RouteComponent() {
  const { data: usersWithTierlists } = useSuspenseQuery(tierlistQueries.all())

  return (
    <div className="w-full min-h-full p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Tierlists</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usersWithTierlists.map((user, index) => (
            <div
              key={user.id}
              className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md relative"
            >
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: getUserColor(index) }}
              />
              <div className="p-6 border-b bg-secondary/10 pl-8">
                <Link
                  to="/tierlist/$userId"
                  params={{ userId: user.id }}
                  className="group flex items-center gap-4 hover:opacity-80 transition-opacity"
                >
                  <Avatar
                    src={user.image}
                    alt={user.name}
                    name={user.name}
                    size={48}
                  />
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg leading-none">
                      {user.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.tierlists.length}{' '}
                      {user.tierlists.length === 1 ? 'tierlist' : 'tierlists'}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </Link>
              </div>

              <div className="p-2 flex-1 pl-4">
                <ul className="space-y-1">
                  {user.tierlists.map((tierlist) => {
                    const movieCount = tierlist.tiers.reduce(
                      (acc, tier) => acc + (tier.moviesOnTiers?.length || 0),
                      0,
                    )
                    const tierCount = tierlist.tiers.length

                    return (
                      <li key={tierlist.id}>
                        <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">
                              {tierlist.title || 'Untitled Tierlist'}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                {tierCount} {tierCount === 1 ? 'tier' : 'tiers'}
                              </span>
                              <span>•</span>
                              <span>
                                {movieCount}{' '}
                                {movieCount === 1 ? 'movie' : 'movies'}
                              </span>
                            </div>
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
