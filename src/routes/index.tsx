import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useQuery } from '@tanstack/react-query'
import { Clapperboard } from 'lucide-react'
import type { Movie } from '@/lib/tmdb-api'
import { FALLBACK_POSTERS } from '@/lib/tmdb-api'
import { ErrorComponent } from '@/components/error-component'
import LoginDialog from '@/components/login/login-dialog'
import { authMiddleware } from '@/middleware/auth'
import { MoviePosterCard } from '@/components/login/movie-poster-card'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'

// Server function to get the current user
const getCurrentUserServerFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.user
  })

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
  const { data: movies } = useQuery(tmdbQueries.backgroundMovies(9))
  const displayMovies: Array<Movie> =
    movies && movies.length > 0 ? movies : FALLBACK_POSTERS

  const POSTER_CONFIG = [
    { x: '65%', y: '12%', rotate: 6, scale: 0.95, zIndex: 2 },
    { x: '78%', y: '38%', rotate: -4, scale: 0.88, zIndex: 1 },
    { x: '70%', y: '65%', rotate: 3, scale: 0.92, zIndex: 3 },
  ]

  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {displayMovies.slice(0, 3).map((movie, i) => {
          const config = POSTER_CONFIG[i]
          return (
            <div
              key={`poster-${i}`}
              className="absolute"
              style={{
                left: config.x,
                top: config.y,
                transform: `rotate(${config.rotate}deg) scale(${config.scale})`,
                zIndex: config.zIndex,
              }}
            >
              <div className="w-28 sm:w-44 md:w-52 aspect-[2/3] rounded-md overflow-hidden shadow-2xl shadow-foreground/20 opacity-60 sm:opacity-80 md:opacity-100">
                <MoviePosterCard movie={movie} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative z-20 min-h-screen flex flex-col">
        <header className="flex items-center w-full px-6 sm:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Clapperboard className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">MovieClub</span>
          </div>
        </header>

        <main className="flex-1 flex items-center px-6 sm:px-12">
          <div className="max-w-2xl">
            <div className="space-y-8">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-left leading-[1.1]">
                Watch together.
                <br />
                <span className="text-primary">Decide together.</span>
              </h1>
              <p className="text-lg text-muted-foreground text-left max-w-lg">
                The social way to track movies, build shortlists, and pick your
                next group watch.
              </p>
              <div className="pt-4">
                <LoginDialog />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
