import type { NextMovieToWatch } from '@/lib/react-query/queries/dashboard'
import { getImageUrl } from '@/lib/tmdb-api'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Calendar, Clock, ExternalLink, Play, Star } from 'lucide-react'

interface MovieSpotlightProps {
  movieData: NextMovieToWatch
}

export function MovieSpotlight({ movieData }: MovieSpotlightProps) {
  const { movie, user } = movieData

  const backdropPath = movie.images?.backdrops?.[0]?.file_path
  const posterPath = movie.images?.posters?.[0]?.file_path
  const backdropUrl = backdropPath
    ? getImageUrl(backdropPath, 'original')
    : null
  const posterUrl = posterPath ? getImageUrl(posterPath, 'w500') : null

  const tmdbUrl = `https://www.themoviedb.org/movie/${movie.tmdbId}`
  const imdbUrl = movie.imdbId
    ? `https://www.imdb.com/title/${movie.imdbId}`
    : null

  const watchProviders = movie.watchProviders

  return (
    <div className="relative h-full overflow-hidden rounded-lg border bg-card shadow-2xl">
      <div className="absolute inset-0">
        {backdropUrl ? (
          <>
            <img
              src={backdropUrl}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
        )}
      </div>
      <div className="relative h-full flex flex-col p-8 lg:p-12">
        <div className="flex items-start gap-2 mb-6">
          <Play className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
              Next Up
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Ready to watch</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col lg:flex-row gap-8">
          {posterUrl && (
            <div className="flex-shrink-0">
              <div className="w-48 lg:w-64 overflow-hidden rounded-lg shadow-2xl border-2 border-border/50 ring-4 ring-background/50">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-lg text-muted-foreground italic">
                    &ldquo;{movie.tagline}&rdquo;
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {movie.releaseDate && (
                  <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {format(new Date(movie.releaseDate), 'yyyy')}
                    </span>
                  </div>
                )}
                {movie.runtime && (
                  <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{movie.runtime} min</span>
                  </div>
                )}
                {movie.voteAverage > 0 && (
                  <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {movie.voteAverage.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary border border-primary/30"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              {movie.overview && (
                <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-border/50">
                  <p className="text-base text-foreground/90 leading-relaxed">
                    {movie.overview}
                  </p>
                </div>
              )}
              {watchProviders?.providers &&
                watchProviders.providers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                      Available On
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {watchProviders.providers
                        .slice(0, 5)
                        .map((provider: any) => (
                          <Link
                            to={watchProviders.link || tmdbUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div
                              key={provider.provider_id}
                              className="flex items-center gap-2 rounded-lg border-2 bg-background px-4 py-2 shadow-sm hover:shadow-md transition-shadow"
                              title={provider.provider_name}
                            >
                              {provider.logo_path && (
                                <img
                                  src={
                                    getImageUrl(provider.logo_path, 'w92') || ''
                                  }
                                  alt={provider.provider_name}
                                  className="h-6 w-6 rounded"
                                />
                              )}
                              <span className="text-sm font-medium">
                                {provider.provider_name}
                              </span>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
            </div>
            <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-border/50">
              <a
                href={tmdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ExternalLink className="h-4 w-4" />
                View on TMDB
              </a>
              {imdbUrl && (
                <a
                  href={imdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border-2 bg-background px-6 py-3 text-sm font-semibold transition-all hover:bg-accent hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on IMDb
                </a>
              )}
              <div className="flex-1" />
              <div className="text-xs text-muted-foreground self-end">
                Added by{' '}
                <span className="font-semibold text-foreground">
                  {user.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
