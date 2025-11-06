import { Calendar, ExternalLink, Star } from 'lucide-react'

interface MovieMetadataProps {
  releaseDate?: string
  voteAverage: number
  voteCount: number
  imdbId?: string
  tmdbId?: number
}

export function MovieMetadata({
  releaseDate,
  voteAverage,
  voteCount,
  imdbId,
  tmdbId,
}: MovieMetadataProps) {
  return (
    <div className="flex items-center gap-4 text-sm">
      {releaseDate && (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(releaseDate).getFullYear()}</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span>{voteAverage.toFixed(1)}</span>
        <span className="text-muted-foreground">
          ({voteCount.toLocaleString()} votes)
        </span>
      </div>
      {(imdbId || tmdbId) && (
        <div className="flex items-center gap-2 ml-auto">
          {imdbId && (
            <a
              href={`https://www.imdb.com/title/${imdbId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded px-2 py-1 bg-[#F5C518] text-black hover:bg-[#F5C518]/90 transition-colors text-xs font-semibold"
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
              className="flex items-center gap-1 rounded px-2 py-1 bg-[#01b4e4] text-white hover:bg-[#01b4e4]/90 transition-colors text-xs font-semibold"
              title="View on TMDb"
            >
              <span>TMDb</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}
