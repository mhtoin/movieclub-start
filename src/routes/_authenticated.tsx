import { ErrorComponent } from '@/components/error-component'
import Header from '@/components/header/header'
import { ShortlistToolbar } from '@/components/shortlist-toolbar/shortlist-toolbar'
import { getSessionUser, useAppSession } from '@/lib/auth/auth'
import {
  createFileRoute,
  Outlet,
  redirect,
  useMatches,
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
    const user = await getCurrentUserServerFn()
    if (!user) {
      throw redirect({ to: '/' })
    }
    return { user }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext()
  const matches = useMatches()
  const isHomePage = matches.some(
    (match) => match.routeId === '/_authenticated/home',
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div
        className={
          isHomePage ? 'flex-1 overflow-auto' : 'pt-20 flex-1 overflow-auto'
        }
      >
        <Outlet />
        <ShortlistToolbar userId={user?.userId} />
      </div>
    </div>
  )
}
