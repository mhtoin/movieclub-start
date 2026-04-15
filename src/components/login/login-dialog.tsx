import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import {
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTrigger,
} from '../ui/dialog'
import LoginForm from './login-form'
import { MoviePosterCard } from './movie-poster-card'
import type { LoginMethod } from '@/lib/auth/last-used-login'
import type { Movie } from '@/lib/tmdb-api'
import { FALLBACK_POSTERS } from '@/lib/tmdb-api'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { getLastUsedLoginMethodFromClient } from '@/lib/auth/last-used-login'

export default function LoginDialog() {
  const queryClient = useQueryClient()

  const prefetchPosters = () => {
    queryClient.prefetchQuery(tmdbQueries.backgroundMovies(12))
  }

  return (
    <DialogRoot>
      <DialogTrigger onMouseEnter={prefetchPosters} onFocus={prefetchPosters}>
        <Button variant="primary">Login or Sign Up</Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="p-0 overflow-hidden max-w-5xl w-full">
          <LoginDialogContent />
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  )
}

function LoginDialogContent() {
  const { data: movies } = useQuery(tmdbQueries.backgroundMovies(12))
  const [lastUsedMethod, setLastUsedMethod] = useState<LoginMethod | null>(null)

  useEffect(() => {
    setLastUsedMethod(getLastUsedLoginMethodFromClient())
  }, [])

  const displayMovies: Array<Movie> =
    movies && movies.length > 0 ? movies : FALLBACK_POSTERS

  return (
    <div className="flex flex-col md:flex-row min-h-[600px]">
      <div className="hidden md:flex flex-col justify-between bg-background text-foreground w-1/2 lg:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="grid grid-cols-4 gap-2 p-6 h-full">
            {displayMovies.slice(0, 8).map((movie, i) => (
              <div
                key={`poster-${i}`}
                className="aspect-[2/3] rounded-md overflow-hidden bg-muted"
              >
                <MoviePosterCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-background/30 to-background" />
        <div className="relative z-10 p-10 flex flex-col h-full justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M19.82 2H4.18A2.18 2.18 0 0 0 2 4.18v15.64A2.18 2.18 0 0 0 4.18 22h15.64A2.18 2.18 0 0 0 22 19.82V4.18A2.18 2.18 0 0 0 19.82 2Z" />
              <path d="M7 2v20" />
              <path d="M17 2v20" />
              <path d="M2 12h20" />
              <path d="M2 7h5" />
              <path d="M2 17h5" />
              <path d="M17 17h5" />
              <path d="M17 7h5" />
            </svg>
            <span className="font-bold text-xl tracking-tight">MovieClub</span>
          </div>

          <div className="mt-auto">
            <p className="text-sm text-muted-foreground/70 italic">
              "The movies we love are the ones we watch together."
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center relative bg-dialog-background">
        <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="w-full max-w-sm mx-auto">
          <LoginForm lastUsedMethod={lastUsedMethod} />
        </div>
      </div>
    </div>
  )
}
