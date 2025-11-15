import type { NextMovieToWatch } from '@/lib/react-query/queries/dashboard'
import { getImageUrl } from '@/lib/tmdb-api'
import { format } from 'date-fns'
import { Calendar, Clock, ExternalLink, Star } from 'lucide-react'

interface NextMovieCardProps {
  movieData: NextMovieToWatch
}

export function NextMovieCard({ movieData }: NextMovieCardProps) {
  const { movie, user } = movieData

  const backdropPath = movie.images?.backdrops?.[0]?.file_path
  const posterPath = movie.images?.posters?.[0]?.file_path
  const backdropUrl = backdropPath
    ? getImageUrl(backdropPath, 'w1280')
    : posterPath
      ? getImageUrl(posterPath, 'w500')
      : null

  const tmdbUrl = `https://www.themoviedb.org/movie/${movie.tmdbId}`
  const imdbUrl = movie.imdbId
    ? `https://www.imdb.com/title/${movie.imdbId}`
    : null

  const watchProviders = movie.watchProviders
  console.log('watchProviders:', watchProviders)

  return (
    <div className="relative overflow-hidden rounded-lg border bg-card shadow-lg">
      <div className="relative h-80 overflow-hidden">
        {backdropUrl ? (
          <>
            <img
              src={backdropUrl}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">🎬</div>
              <p className="text-muted-foreground">No image available</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-start gap-4">
            {posterPath && (
              <div className="hidden sm:block flex-shrink-0">
                <div className="w-24 overflow-hidden rounded-md border-2 border-background shadow-xl">
                  <img
                    src={getImageUrl(posterPath, 'w185') || ''}
                    alt={movie.title}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold text-foreground mb-2 line-clamp-2">
                {movie.title}
              </h2>
              {movie.tagline && (
                <p className="text-sm text-muted-foreground italic mb-2 line-clamp-1">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {movie.releaseDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(movie.releaseDate), 'yyyy')}</span>
                  </div>
                )}
                {movie.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
                {movie.voteAverage > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{movie.voteAverage.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {movie.overview && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Overview</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {movie.overview}
            </p>
          </div>
        )}
        {movie.genres && movie.genres.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}
        {watchProviders?.providers && watchProviders.providers.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Available On</h3>
            <div className="flex flex-wrap gap-2">
              {watchProviders.providers.slice(0, 5).map((provider: any) => (
                <div
                  key={provider.provider_id}
                  className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5"
                  title={provider.provider_name}
                >
                  {provider.logo_path && (
                    <img
                      src={getImageUrl(provider.logo_path, 'w92') || ''}
                      alt={provider.provider_name}
                      className="h-5 w-5 rounded"
                    />
                  )}
                  <span className="text-xs font-medium">
                    {provider.provider_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={tmdbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ExternalLink className="h-4 w-4" />
            View on TMDB
          </a>
          {imdbUrl && (
            <a
              href={imdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4" />
              View on IMDb
            </a>
          )}
        </div>

        {/* Added By */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Added by{' '}
            <span className="font-medium text-foreground">{user.name}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
