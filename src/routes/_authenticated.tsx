import { ProjectorBackground } from '@/components/background-options'
import { ErrorComponent } from '@/components/error-component'
import Sidebar from '@/components/sidebar/sidebar'
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
    return { user: context.user }
  })

// On the server (SSR): resolve auth directly in-process — no server function
// overhead, no serialization, no extra hop through the function pipeline.
// On the client: delegate to the server function so cookies are read server-side,
// with the result cached in React Query for 2 minutes.
const getAuthContext = createIsomorphicFn()
  .server(async () => {
    const { useAppSession, getSessionUser } = await import('@/lib/auth/auth')
    const session = await useAppSession()
    const user = await getSessionUser(session.data?.sessionToken)
    return { user }
  })
  .client(() => getAuthContextServerFn())

export const Route = createFileRoute('/_authenticated')({
  errorComponent: ErrorComponent,
  beforeLoad: async ({ context }) => {
    if (import.meta.env.SSR) {
      const { user } = await getAuthContext()
      if (!user) throw redirect({ to: '/' })
      return { user }
    }
    const { user } = await context.queryClient.fetchQuery({
      queryKey: ['authContext'],
      queryFn: () => getAuthContext(),
      staleTime: 1000 * 60 * 2,
    })
    if (!user) throw redirect({ to: '/' })
    return { user }
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
  const { user } = Route.useRouteContext()
  useSSEInvalidation()
  const matches = useMatches()
  const isHomePage = matches.some(
    (match) => match.routeId === '/_authenticated/home',
  )

  return (
    <DeviceCapabilityProvider>
      <div className="h-screen flex flex-col overflow-hidden relative">
        <Sidebar />
        <ProjectorBackground />
        <div
          className={
            isHomePage
              ? 'flex-1 overflow-auto relative z-10 isolate'
              : 'pt-4 pb-24 md:pb-4 px-4 flex-1 overflow-auto relative z-10 isolate'
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
