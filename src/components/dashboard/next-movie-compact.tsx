import { ExternalLink, Play } from 'lucide-react'
import type { NextMovieToWatch } from '@/lib/react-query/queries/dashboard'
import { getImageUrl } from '@/lib/tmdb-api'

interface NextMovieCompactProps {
  movieData: NextMovieToWatch
}

export function NextMovieCompact({ movieData }: NextMovieCompactProps) {
  const { movie, user } = movieData

  const posterPath = movie.images?.posters?.[0]?.file_path
  const posterUrl = posterPath ? getImageUrl(posterPath, 'w185') : null

  const tmdbUrl = `https://www.themoviedb.org/movie/${movie.tmdbId}`
  const watchProviders = movie.watchProviders

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Play className="h-4 w-4 text-primary ml-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Next Up
          </p>
          <p className="font-semibold truncate">{movie.title}</p>
        </div>
      </div>

      {posterUrl && (
        <div className="w-12 h-18 rounded-md overflow-hidden border border-border flex-shrink-0">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-2 flex-shrink-0">
        {watchProviders?.providers && watchProviders.providers.length > 0 && (
          <div className="flex items-center gap-1">
            {watchProviders.providers.slice(0, 3).map((p: any) => (
              <div
                key={p.provider_id}
                className="w-6 h-6 rounded overflow-hidden"
                title={p.provider_name}
              >
                {p.logo_path && (
                  <img
                    src={getImageUrl(p.logo_path, 'w92') ?? ''}
                    alt={p.provider_name}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <a
          href={tmdbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title="View on TMDB"
        >
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
      </div>

      <div className="text-xs text-muted-foreground flex-shrink-0 pl-2 border-l border-border">
        <span className="opacity-60">by</span>{' '}
        <span className="font-medium">{user.name}</span>
      </div>
    </div>
  )
}
