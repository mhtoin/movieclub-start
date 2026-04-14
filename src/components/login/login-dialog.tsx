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
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { getLastUsedLoginMethodFromClient } from '@/lib/auth/last-used-login'

const FALLBACK_POSTERS: Array<Movie> = [
  {
    id: 155,
    title: 'The Dark Knight',
    overview: '',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: null,
    release_date: '2008-07-16',
    vote_average: 9.0,
    vote_count: 30000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'The Dark Knight',
    popularity: 500,
    video: false,
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: '',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: null,
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 35000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'Interstellar',
    popularity: 400,
    video: false,
  },
  {
    id: 27205,
    title: 'Inception',
    overview: '',
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: null,
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 40000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'Inception',
    popularity: 450,
    video: false,
  },
  {
    id: 238,
    title: 'The Godfather',
    overview: '',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: null,
    release_date: '1972-03-14',
    vote_average: 8.7,
    vote_count: 20000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'The Godfather',
    popularity: 300,
    video: false,
  },
  {
    id: 603,
    title: 'The Matrix',
    overview: '',
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdrop_path: null,
    release_date: '1999-03-30',
    vote_average: 8.2,
    vote_count: 28000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'The Matrix',
    popularity: 350,
    video: false,
  },
  {
    id: 550,
    title: 'Fight Club',
    overview: '',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: null,
    release_date: '1999-10-15',
    vote_average: 8.4,
    vote_count: 27000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'Fight Club',
    popularity: 320,
    video: false,
  },
  {
    id: 13,
    title: 'Forrest Gump',
    overview: '',
    poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    backdrop_path: null,
    release_date: '1994-06-23',
    vote_average: 8.5,
    vote_count: 26000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'Forrest Gump',
    popularity: 280,
    video: false,
  },
  {
    id: 496243,
    title: 'Parasite',
    overview: '',
    poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdrop_path: null,
    release_date: '2019-05-30',
    vote_average: 8.5,
    vote_count: 18000,
    genre_ids: [],
    adult: false,
    original_language: 'ko',
    original_title: 'Gisaengchung',
    popularity: 250,
    video: false,
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    overview: '',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdrop_path: null,
    release_date: '1994-09-23',
    vote_average: 8.7,
    vote_count: 24000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'The Shawshank Redemption',
    popularity: 200,
    video: false,
  },
]

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
        <div
          className="absolute inset-0 z-0 flex items-center justify-center opacity-30 dark:opacity-40"
          style={{ perspective: '1000px' }}
        >
          <div
            className="grid grid-cols-3 gap-4 w-[150%] h-[200%]"
            style={{
              transform:
                'rotateY(20deg) rotateZ(-5deg) scale(1.2) translateX(-5%)',
              transformOrigin: 'center center',
            }}
          >
            <div className="flex flex-col gap-4 motion-safe:animate-poster-scroll">
              {[...Array(12)].map((_, i) => (
                <MoviePosterCard
                  key={`col1-${i}`}
                  movie={displayMovies[i % displayMovies.length]}
                />
              ))}
            </div>
            <div
              className="flex flex-col gap-4 motion-safe:animate-poster-scroll"
              style={{
                animationDirection: 'reverse',
                animationDuration: '75s',
              }}
            >
              {[...Array(12)].map((_, i) => (
                <MoviePosterCard
                  key={`col2-${i}`}
                  movie={displayMovies[(i + 3) % displayMovies.length]}
                />
              ))}
            </div>
            <div
              className="flex flex-col gap-4 motion-safe:animate-poster-scroll"
              style={{ animationDuration: '90s' }}
            >
              {[...Array(12)].map((_, i) => (
                <MoviePosterCard
                  key={`col3-${i}`}
                  movie={displayMovies[(i + 6) % displayMovies.length]}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-background/50 to-background" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background via-transparent to-transparent h-32" />
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
