import {
  BACKGROUND_OPTIONS,
  type BackgroundOptionKey,
} from '@/components/background-options'
import { ErrorComponent } from '@/components/error-component'
import { ShortlistToolbar } from '@/components/shortlist-toolbar/shortlist-toolbar'
import Sidebar from '@/components/sidebar/sidebar'
import {
  type BackgroundPreference,
  backgroundValidator,
} from '@/lib/background-preference'
import { DeviceCapabilityProvider } from '@/lib/hooks/use-device-capability'
import { useSSEInvalidation } from '@/lib/hooks/use-sse-invalidation'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { authMiddleware } from '@/middleware/auth'
import {
  createFileRoute,
  Outlet,
  redirect,
  useMatches,
  useRouterState,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

// Server function to get the current user + background preference in a single
const getAuthContextServerFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // Read background preference from cookie
    const { getCookie } = await import('@tanstack/react-start/server')
    const cookieBackground = getCookie('background-style') || 'backdropVeil'
    let backgroundPreference: BackgroundPreference = 'backdropVeil'
    try {
      backgroundPreference = backgroundValidator.parse(cookieBackground)
    } catch {
      // keep default
    }

    return { user: context.user, backgroundPreference }
  })

export const Route = createFileRoute('/_authenticated')({
  errorComponent: ErrorComponent,
  beforeLoad: async ({ context }) => {
    const { user, backgroundPreference } = await context.queryClient.fetchQuery(
      {
        queryKey: ['authContext'],
        queryFn: () => getAuthContextServerFn(),
        // Cache for 2 minutes — avoids a network round-trip on every
        // client-side navigation between authenticated routes.
        staleTime: 1000 * 60 * 2,
      },
    )
    if (!user) {
      throw redirect({ to: '/' })
    }
    return { user, backgroundPreference }
  },
  loader: ({ context }) => {
    const user = context.user
    if (user?.userId) {
      context.queryClient.prefetchQuery(shortlistQueries.byUser(user.userId))
      context.queryClient.prefetchQuery(movieQueries.latest())
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user, backgroundPreference } = Route.useRouteContext()
  useSSEInvalidation()
  const matches = useMatches()
  const isHomePage = matches.some(
    (match) => match.routeId === '/_authenticated/home',
  )
  const isPending = useRouterState({ select: (s) => s.status === 'pending' })

  const BackgroundComponent =
    BACKGROUND_OPTIONS[backgroundPreference as BackgroundOptionKey]
      ?.component ?? BACKGROUND_OPTIONS.backdropVeil.component

  return (
    <DeviceCapabilityProvider>
      <div className="h-screen flex flex-col overflow-hidden relative">
        {isPending && (
          <div className="fixed inset-x-0 top-0 z-[9999] h-[2px]">
            <div className="h-full bg-primary animate-[progress_1.2s_ease-in-out_infinite] origin-left" />
          </div>
        )}
        <Sidebar />
        <BackgroundComponent />
        <div
          className={
            isHomePage
              ? 'flex-1 overflow-auto relative z-10 isolate'
              : 'pt-4 pb-24 md:pb-4 md:pl-16 px-4 flex-1 overflow-auto relative z-10 isolate'
          }
        >
          <Outlet />
          <ShortlistToolbar userId={user?.userId} />
        </div>
      </div>
    </DeviceCapabilityProvider>
  )
}
