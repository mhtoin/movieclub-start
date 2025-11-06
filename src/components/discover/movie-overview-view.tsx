import { Button } from '@/components/ui/button'
import { TMDBMovieResponse } from '@/types/tmdb'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { MovieMetadata } from './movie-metadata'
import { WatchProvidersList } from './watch-providers'

interface MovieOverviewViewProps {
  title: string
  originalTitle: string
  releaseDate: string
  voteAverage: number
  voteCount: number
  overview: string
  movieDetails?: TMDBMovieResponse
  onAddToShortlist: () => void
  onShowMoreInfo: () => void
  isPending: boolean
}

export function MovieOverviewView({
  title,
  originalTitle,
  releaseDate,
  voteAverage,
  voteCount,
  overview,
  movieDetails,
  onAddToShortlist,
  onShowMoreInfo,
  isPending,
}: MovieOverviewViewProps) {
  const [showFullOverview, setShowFullOverview] = useState(false)

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold">{title}</h2>
        {originalTitle !== title && (
          <p className="text-sm text-muted-foreground">{originalTitle}</p>
        )}
      </div>

      <MovieMetadata
        releaseDate={releaseDate}
        voteAverage={voteAverage}
        voteCount={voteCount}
        imdbId={movieDetails?.imdb_id}
        tmdbId={movieDetails?.id}
      />

      {overview && (
        <div>
          <h3 className="mb-2 font-semibold">Overview</h3>
          <div>
            <p
              className={`text-sm leading-relaxed text-muted-foreground ${
                !showFullOverview ? 'line-clamp-4' : ''
              }`}
            >
              {overview}
            </p>
            {overview.length > 200 && (
              <button
                onClick={() => setShowFullOverview(!showFullOverview)}
                className="text-xs text-primary hover:underline mt-1"
              >
                {showFullOverview ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      )}

      {movieDetails?.['watch/providers'] && (
        <WatchProvidersList watchProviders={movieDetails['watch/providers']} />
      )}

      <div className="flex gap-3 pt-4">
        <Button
          className="gap-2"
          variant={'primary'}
          loading={isPending}
          onClick={onAddToShortlist}
        >
          <Plus className="h-4 w-4" />
          Add to Shortlist
        </Button>
        <Button variant="secondary" onClick={onShowMoreInfo}>
          More Info
        </Button>
      </div>
    </>
  )
}
