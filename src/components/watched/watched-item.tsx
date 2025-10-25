import type { Movie } from '@/db/schema/movies'
import { User } from '@/db/schema/users'
import { useElementInView } from '@/lib/hooks'
import { Route } from '@/routes/_authenticated/watched'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Calendar, Clock, Users, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Avatar from '../ui/avatar'
import { Button } from '../ui/button'
import {
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTrigger,
} from '../ui/dialog'

export function WatchedItem({ movie, user }: { movie: Movie; user: User }) {
  const [open, setOpen] = useState(false)
  const search = Route.useSearch()
  const itemRef = useRef<HTMLDivElement>(null)
  const { isInView, intersectionRatio } = useElementInView(
    itemRef as React.RefObject<HTMLElement>,
    {
      threshold: [0, 0.1, 0.5, 1],
      rootMargin: '-20px 0px -20px 0px',
    },
  )

  // Close dialog when search params change (e.g., when filtering by user)
  useEffect(() => {
    setOpen(false)
  }, [search])
  const posterUrl = movie?.images?.posters?.[0]?.file_path
    ? `https://image.tmdb.org/t/p/w342${movie.images.posters[0].file_path}`
    : '/placeholder_movie_poster.png'

  const backdropUrl = movie?.images?.backdrops?.[0]?.file_path
    ? `https://image.tmdb.org/t/p/w1280${movie.images.backdrops[0].file_path}`
    : null

  const watchDate = movie?.watchDate ? new Date(movie.watchDate) : null

  const opacity = Math.max(0.3, intersectionRatio)
  const translateY = isInView ? 0 : 20
  const scale = 0.95 + intersectionRatio * 0.05

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div
          ref={itemRef}
          className="group relative bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-500 ease-out hover:translate-x-0.2 cursor-pointer"
          style={{
            opacity,
            transform: `translateY(${translateY}px) scale(${scale})`,
          }}
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src={posterUrl}
                alt={movie?.title}
                width={80}
                height={120}
                className="rounded-md object-cover"
              />
            </div>
            <div className="flex-grow min-w-0">
              <div className="grid grid-cols-8 gap-4">
                <div className="flex-grow min-w-0 col-span-6">
                  <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                    {movie?.title}
                  </h3>
                  {watchDate && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      <span>{format(watchDate, 'MMMM d, yyyy')}</span>
                    </div>
                  )}
                  {movie?.overview && (
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
                {user && (
                  <div className="flex justify-start gap-2 flex-shrink-0 col-span-2">
                    <Avatar
                      src={user.image}
                      alt={`${user.name}'s avatar`}
                      name={user.name}
                      size={32}
                    />

                    <div className="text-sm">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-muted-foreground">Chosen by</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogPortal>
        <DialogBackdrop opacity="medium" />
        <DialogPopup size="xl" className="max-h-[90vh] overflow-y-auto">
          <DialogClose>
            <Button
              variant={'icon'}
              className="absolute top-4 right-4 z-[120] p-2 rounded-full bg-background/80 hover:bg-background border border-border transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
          <div className="relative">
            {backdropUrl && (
              <div className="relative w-full h-64 -mx-10 -mt-10 mb-6 overflow-hidden">
                <img
                  src={backdropUrl}
                  alt={movie?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dialog-background via-dialog-background/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-l from-dialog-background via-dialog-background/20 to-transparent" />
              </div>
            )}

            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={posterUrl}
                    alt={movie?.title}
                    width={160}
                    height={240}
                    className="rounded-lg object-cover shadow-lg"
                  />
                </div>
                <div className="flex-grow space-y-3">
                  <h2 className="text-3xl font-bold">{movie?.title}</h2>
                  {movie?.tagline && (
                    <p className="text-lg italic text-muted-foreground">
                      {movie?.tagline}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    {watchDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(watchDate, 'MMMM d, yyyy')}</span>
                      </div>
                    )}
                    {movie?.runtime && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{movie?.runtime} min</span>
                      </div>
                    )}
                  </div>

                  {movie?.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {movie?.genres.map((genre) => (
                        <Link
                          from={Route.fullPath}
                          to="."
                          search={{ genre: genre }}
                        >
                          <span
                            key={genre}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {genre}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {user && (
                    <Link
                      from={Route.fullPath}
                      to="."
                      search={{ user: user.name }}
                    >
                      <div className="flex items-center gap-3 pt-2">
                        <Avatar
                          src={user.image}
                          alt={`${user.name}'s avatar`}
                          name={user.name}
                          size={40}
                        />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Chosen by
                          </p>
                          <p className="font-semibold">{user.name}</p>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {movie?.overview && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Overview</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {movie?.overview}
                  </p>
                </div>
              )}

              {movie?.cast && movie?.cast.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Cast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {movie?.cast?.slice(0, 6).map((actor: any) => (
                      <div key={actor.id} className="flex gap-3">
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{actor.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {actor.character}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  )
}
