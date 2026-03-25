import {
  BACKGROUND_OPTIONS,
  type BackgroundOptionKey,
} from '@/components/background-options'
import { ErrorComponent } from '@/components/error-component'
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
import { createIsomorphicFn, createServerFn } from '@tanstack/react-start'
import { lazy, Suspense } from 'react'

const ShortlistToolbar = lazy(() =>
  import('@/components/shortlist-toolbar/shortlist-toolbar').then((m) => ({
    default: m.ShortlistToolbar,
  })),
)

// Server function used by the client path to fetch auth context via RPC.
const getAuthContextServerFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
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

// On the server (SSR): resolve auth directly in-process — no server function
// overhead, no serialization, no extra hop through the function pipeline.
// On the client: delegate to the server function so cookies are read server-side,
// with the result cached in React Query for 2 minutes.
const getAuthContext = createIsomorphicFn()
  .server(async () => {
    const { useAppSession, getSessionUser } = await import('@/lib/auth/auth')
    const { getCookie } = await import('@tanstack/react-start/server')
    const session = await useAppSession()
    const user = await getSessionUser(session.data?.sessionToken)
    const cookieBg = getCookie('background-style') || 'backdropVeil'
    let backgroundPreference: BackgroundPreference = 'backdropVeil'
    try {
      backgroundPreference = backgroundValidator.parse(cookieBg)
    } catch {
      // keep default
    }
    return { user, backgroundPreference }
  })
  .client(() => getAuthContextServerFn())

export const Route = createFileRoute('/_authenticated')({
  errorComponent: ErrorComponent,
  beforeLoad: async ({ context }) => {
    if (import.meta.env.SSR) {
      // Server path: getAuthContext.server() is called directly in-process.
      const { user, backgroundPreference } = await getAuthContext()
      if (!user) throw redirect({ to: '/' })
      return { user, backgroundPreference }
    }
    // Client path: result is cached in React Query, so navigating between
    // authenticated routes does not make a network round-trip.
    const { user, backgroundPreference } = await context.queryClient.fetchQuery(
      {
        queryKey: ['authContext'],
        queryFn: () => getAuthContext(),
        staleTime: 1000 * 60 * 2,
      },
    )
    if (!user) throw redirect({ to: '/' })
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
              ? 'md:pl-16 flex-1 overflow-auto relative z-10 isolate'
              : 'pt-4 pb-24 md:pb-4 md:pl-16 px-4 flex-1 overflow-auto relative z-10 isolate'
          }
        >
          <Outlet />
          <Suspense fallback={null}>
            <ShortlistToolbar userId={user?.userId} />
          </Suspense>
        </div>
      </div>
    </DeviceCapabilityProvider>
  )
}
