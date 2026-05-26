import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'
import { useRef } from 'react'
import Avatar from '../ui/avatar'
import type { MovieWithCredits } from '@/db/schema/movies'
import type { User } from '@/db/schema/users'
import { useElementInView } from '@/lib/hooks'

export function WatchedItem({
  movie,
  user,
  compact = false,
}: {
  movie: MovieWithCredits
  user: User
  compact?: boolean
}) {
  const itemRef = useRef<HTMLAnchorElement>(null)
  const { isInView, intersectionRatio } = useElementInView(
    itemRef as React.RefObject<HTMLElement>,
    {
      threshold: [0, 0.1, 0.5, 1],
      rootMargin: '-20px 0px -20px 0px',
    },
  )

  const posterUrl = movie.images?.posters?.[0]?.file_path
    ? `https://image.tmdb.org/t/p/w342${movie.images.posters[0].file_path}`
    : '/placeholder_movie_poster.png'

  const watchDate = movie.watchDate ? new Date(movie.watchDate) : null

  const opacity = Math.max(0.3, intersectionRatio)
  const translateY = isInView ? 0 : 20
  const scale = 0.95 + intersectionRatio * 0.05

  if (compact) {
    return (
      <Link
        to="/watched/$movieId"
        params={{ movieId: movie.id }}
        className="group relative w-full block bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all active:scale-98 text-left"
      >
        <div className="flex gap-3 p-3">
          <div className="flex-shrink-0">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-16 h-24 rounded object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <h3 className="font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {movie.title}
              </h3>
              {watchDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  <span>{format(watchDate, 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Avatar
                src={user.image}
                alt={`${user.name}'s avatar`}
                name={user.name}
                size={24}
              />
              <span className="text-xs text-muted-foreground truncate">
                {user.name}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to="/watched/$movieId"
      params={{ movieId: movie.id }}
      ref={itemRef}
      className="group relative block bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-500 ease-out hover:translate-x-0.2 cursor-pointer"
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <img
            src={posterUrl}
            alt={movie.title}
            width={80}
            height={120}
            className="rounded-md object-cover"
          />
        </div>
        <div className="flex-grow min-w-0">
          <div className="grid grid-cols-8 gap-4">
            <div className="flex-grow min-w-0 col-span-6">
              <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {movie.title}
              </h3>
              {watchDate && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <Calendar className="size-3" />
                  <span>{format(watchDate, 'MMMM d, yyyy')}</span>
                </div>
              )}
              {movie.runtime && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <Clock className="size-3" />
                  <span>{movie.runtime} min</span>
                </div>
              )}
              {movie.overview && (
                <p
                  className="text-sm text-muted-foreground mb-2 overflow-hidden text-ellipsis"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {movie.overview}
                </p>
              )}
            </div>
            <div className="flex justify-start gap-2 flex-shrink-0 col-span-2">
              <Avatar
                src={user.image}
                alt={`${user.name}'s avatar`}
                name={user.name}
                size={32}
              />
              <div className="text-sm min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-muted-foreground">Chosen by</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
