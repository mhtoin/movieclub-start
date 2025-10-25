import Header from '@/components/header'
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
    const session = await useAppSession()
    const sessionToken = session.data?.sessionToken
    return await getSessionUser(sessionToken)
  },
)

export const Route = createFileRoute('/_authenticated')({
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
      </div>
    </div>
  )
}
