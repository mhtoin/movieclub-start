import { Calendar, ExternalLink, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface MovieMetadataProps {
  releaseDate?: string
  voteAverage: number
  voteCount: number
  imdbId?: string
  tmdbId?: number
  isLoading?: boolean
}

export function MovieMetadata({
  releaseDate,
  voteAverage,
  voteCount,
  imdbId,
  tmdbId,
  isLoading,
}: MovieMetadataProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-3">
        {releaseDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground/60" />
            <span className="text-muted-foreground/80">
              {new Date(releaseDate).getFullYear()}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-yellow-500/80" />
          <span className="font-medium">{voteAverage.toFixed(1)}</span>
          <span className="text-muted-foreground/50 text-xs">
            ({voteCount.toLocaleString()})
          </span>
        </div>
      </div>
      {(isLoading || imdbId || tmdbId) && (
        <div className="flex items-center gap-1.5">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-12" />
            </>
          ) : (
            <>
              {imdbId && (
                <a
                  href={`https://www.imdb.com/title/${imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded px-2 py-0.5 bg-[--imdb] text-[--imdb-foreground] hover:opacity-90 transition-opacity text-xs font-semibold"
                  title="View on IMDb"
                >
                  <span>IMDb</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {tmdbId && (
                <a
                  href={`https://www.themoviedb.org/movie/${tmdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded px-2 py-0.5 bg-[--tmdb] text-[--tmdb-foreground] hover:opacity-90 transition-opacity text-xs font-semibold"
                  title="View on TMDb"
                >
                  <span>TMDb</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
