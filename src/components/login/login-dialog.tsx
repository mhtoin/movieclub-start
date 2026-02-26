import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { getImageUrl } from '@/lib/tmdb-api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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

const POSTERS = [
  'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // The Dark Knight
  'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar
  'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', // Inception
  'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', // The Godfather
  'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', // The Matrix
  'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', // Fight Club
  'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', // Forrest Gump
  'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', // Parasite
  'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', // The Shawshank Redemption
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

  const posters = movies
    ? movies.map((m) => getImageUrl(m.poster_path) || '').filter(Boolean)
    : POSTERS

  const displayPosters = posters.length > 0 ? posters : POSTERS

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
                <div
                  key={`col1-${i}`}
                  className="aspect-[2/3] rounded-md bg-muted shadow-2xl overflow-hidden shrink-0"
                >
                  <img
                    src={displayPosters[i % displayPosters.length]}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
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
                <div
                  key={`col2-${i}`}
                  className="aspect-[2/3] rounded-md bg-muted shadow-2xl overflow-hidden shrink-0"
                >
                  <img
                    src={displayPosters[(i + 3) % displayPosters.length]}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              ))}
            </div>
            <div
              className="flex flex-col gap-4 motion-safe:animate-poster-scroll"
              style={{ animationDuration: '90s' }}
            >
              {[...Array(12)].map((_, i) => (
                <div
                  key={`col3-${i}`}
                  className="aspect-[2/3] rounded-md bg-muted shadow-2xl overflow-hidden shrink-0"
                >
                  <img
                    src={displayPosters[(i + 6) % displayPosters.length]}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
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

          <div className="mt-auto mb-4">
            <h2 className="text-3xl font-bold leading-tight mb-4"></h2>
            <p className="text-muted-foreground text-lg"></p>
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
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
