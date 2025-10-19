import Header from '@/components/header'
import { getSessionUser, useAppSession } from '@/lib/auth/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
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
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
