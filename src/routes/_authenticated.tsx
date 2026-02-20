import {
  BACKGROUND_OPTIONS,
  type BackgroundOptionKey,
} from '@/components/background-options'
import { ErrorComponent } from '@/components/error-component'
import { ShortlistToolbar } from '@/components/shortlist-toolbar/shortlist-toolbar'
import Sidebar from '@/components/sidebar/sidebar'
import { getSessionUser, useAppSession } from '@/lib/auth/auth'
import { getBackgroundServerFn } from '@/lib/background-preference'
import { movieQueries } from '@/lib/react-query/queries/movies'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import {
  createFileRoute,
  Outlet,
  redirect,
  useMatches,
  useRouterState,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

// Server function to get the current user
const getCurrentUserServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const session = await useAppSession()
      const sessionToken = session.data?.sessionToken
      return await getSessionUser(sessionToken)
    } catch (error) {
      // If there's a database connection error, throw it to be caught by errorComponent
      if (
        error instanceof Error &&
        (error.message.includes('connect') ||
          error.message.includes('ECONNREFUSED'))
      ) {
        throw new Error(
          'Failed to connect to the database. Please ensure the database is running.',
          { cause: error },
        )
      }
      throw error
    }
  },
)

export const Route = createFileRoute('/_authenticated')({
  errorComponent: ErrorComponent,
  beforeLoad: async () => {
    const [user, backgroundPreference] = await Promise.all([
      getCurrentUserServerFn(),
      getBackgroundServerFn(),
    ])
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
  const matches = useMatches()
  const isHomePage = matches.some(
    (match) => match.routeId === '/_authenticated/home',
  )
  const isPending = useRouterState({ select: (s) => s.status === 'pending' })

  const BackgroundComponent =
    BACKGROUND_OPTIONS[backgroundPreference as BackgroundOptionKey]
      ?.component ?? BACKGROUND_OPTIONS.backdropVeil.component

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Thin top bar that appears when a blocking loader is running.
          With most loaders now using prefetchQuery this rarely shows, but
          gives clear feedback for the remaining await-based routes. */}
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
  )
}
