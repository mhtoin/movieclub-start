import LoginDialog from '@/components/login/login-dialog'
import { getSessionUser, useAppSession } from '@/lib/auth/auth'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

// Server function to get the current user
const getCurrentUserServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    const sessionToken = session.data?.sessionToken
    return await getSessionUser(sessionToken)
  },
)

export const Route = createFileRoute('/')({
  component: LandingPage,
  beforeLoad: async () => {
    const user = await getCurrentUserServerFn()
    if (user) {
      throw redirect({ to: '/home' })
    }
  },
})

function LandingPage() {
  return (
    <div className="p-4 w-full h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 max-w-2xl text-center">
        <h1 className="text-4xl font-bold">Welcome to Movie Club!</h1>
        <LoginDialog />
      </div>
    </div>
  )
}
