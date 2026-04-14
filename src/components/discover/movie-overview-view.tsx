import { Plus } from 'lucide-react'
import { useState } from 'react'
import { MovieMetadata } from './movie-metadata'
import { WatchProvidersList } from './watch-providers'
import type { TMDBMovieResponse } from '@/types/tmdb'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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
  isLoading?: boolean
  compact?: boolean
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
  isLoading,
  compact = false,
}: MovieOverviewViewProps) {
  const [showFullOverview, setShowFullOverview] = useState(false)

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight leading-tight line-clamp-3">
            {title}
          </h2>
          {originalTitle !== title && (
            <p className="text-sm text-muted-foreground mt-0.5 italic line-clamp-1">
              {originalTitle}
            </p>
          )}
        </div>

        <MovieMetadata
          releaseDate={releaseDate}
          voteAverage={voteAverage}
          voteCount={voteCount}
          imdbId={movieDetails?.imdb_id}
          tmdbId={movieDetails?.id}
          isLoading={isLoading}
        />

        {movieDetails?.genres && movieDetails.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {movieDetails.genres.slice(0, 4).map((genre) => (
              <span
                key={genre.id}
                className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-secondary/40 text-secondary-foreground"
              >
                {genre.name}
              </span>
            ))}
            {movieDetails.genres.length > 4 && (
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-secondary/40 text-secondary-foreground">
                +{movieDetails.genres.length - 4}
              </span>
            )}
          </div>
        )}

        {overview && (
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
                className="text-xs text-primary hover:underline mt-1.5"
              >
                {showFullOverview ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div>
            <Skeleton className="h-5 w-28 mb-2" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
        ) : movieDetails?.['watch/providers'] ? (
          <WatchProvidersList
            watchProviders={movieDetails['watch/providers']}
          />
        ) : null}

        <div className={`flex gap-2.5 pt-3 ${compact ? 'flex-col' : ''}`}>
          <Button
            className={`gap-2 ${compact ? 'w-full' : 'flex-1'}`}
            variant={'primary'}
            loading={isPending}
            disabled={isPending}
            onClick={onAddToShortlist}
          >
            <Plus className="h-4 w-4" />
            Add to Shortlist
          </Button>
          <Button
            variant={compact ? 'secondary' : 'ghost'}
            onClick={onShowMoreInfo}
            className={compact ? 'w-full' : 'text-muted-foreground'}
          >
            More Info
          </Button>
        </div>
      </div>
    </>
  )
}
