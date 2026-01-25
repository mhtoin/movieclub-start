import { ErrorComponent } from '@/components/error-component'
import LoginDialog from '@/components/login/login-dialog'
import { getSessionUser, useAppSession } from '@/lib/auth/auth'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Clapperboard, Film, Sparkles, Users } from 'lucide-react'

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
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('database'))
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

export const Route = createFileRoute('/')({
  errorComponent: ErrorComponent,
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
    <div className="min-h-screen w-full bg-background text-foreground overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--primary)_0%,transparent_50%)] opacity-10" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-8 max-w-2xl text-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
              <Clapperboard className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -inset-2 bg-primary/20 rounded-3xl blur-xl -z-10" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Movie Club
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
            {[
              { icon: Film, label: 'Track Watches', desc: 'Log every film' },
              { icon: Users, label: 'Share Lists', desc: 'Pick together' },
              { icon: Sparkles, label: 'Discover', desc: 'Find hidden gems' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/40 bg-background/60 backdrop-blur-sm transition-all hover:bg-background/80 hover:border-border/60"
              >
                <feature.icon className="h-5 w-5 text-primary" />
                <div className="text-sm font-medium">{feature.label}</div>
                <div className="text-xs text-foreground/50">{feature.desc}</div>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <LoginDialog />
          </div>
        </div>
      </div>
    </div>
  )
}
