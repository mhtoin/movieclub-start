import type { LoginMethod } from '@/lib/auth/last-used-login'
import { getLastUsedLoginMethodFromClient } from '@/lib/auth/last-used-login'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import type { Movie } from '@/lib/tmdb-api'
import { FALLBACK_POSTERS } from '@/lib/tmdb-api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { ResponsiveDialog } from '../ui/responsive-dialog'
import LoginForm from './login-form'
import { MoviePosterCard } from './movie-poster-card'

export default function LoginDialog() {
  const queryClient = useQueryClient()

  const prefetchPosters = () => {
    queryClient.prefetchQuery(tmdbQueries.backgroundMovies(12))
  }

  return (
    <ResponsiveDialog>
      <ResponsiveDialog.Trigger
        onMouseEnter={prefetchPosters}
        onFocus={prefetchPosters}
      >
        <Button variant="primary">Login or Sign Up</Button>
      </ResponsiveDialog.Trigger>
      <ResponsiveDialog.Content
        className="p-0 overflow-hidden"
        size="xxl"
        showHandle={false}
      >
        <LoginDialogContent />
      </ResponsiveDialog.Content>
    </ResponsiveDialog>
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
      <div className="hidden md:flex flex-col justify-between w-1/2 lg:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="grid grid-cols-3 lg:grid-cols-4 grid-rows-2 gap-1.5 p-5 h-full">
            {displayMovies.slice(0, 8).map((movie, i) => (
              <div
                key={`poster-${i}`}
                className="rounded-sm overflow-hidden h-full"
              >
                <MoviePosterCard movie={movie} />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-transparent to-dialog-background/95" />
        <div className="relative z-10 p-10 flex flex-col h-full justify-between">
          <div className="inline-flex items-center gap-2 self-start bg-black/40 backdrop-blur-sm rounded-full px-3.5 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-white"
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
            <span className="font-bold text-base tracking-tight text-white">
              MovieClub
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center relative bg-dialog-background">
        <ResponsiveDialog.Close>
          <Button
            className="absolute right-6 top-6"
            variant={'icon'}
            size="icon"
          >
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
          </Button>
        </ResponsiveDialog.Close>

        <div className="w-full max-w-sm mx-auto">
          <LoginForm lastUsedMethod={lastUsedMethod} />
        </div>
      </div>
    </div>
  )
}
