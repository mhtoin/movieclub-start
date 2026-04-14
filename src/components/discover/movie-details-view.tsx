import { ArrowLeft, Plus } from 'lucide-react'
import type { TMDBMovieResponse } from '@/types/tmdb'
import { Button } from '@/components/ui/button'
import { getImageUrl } from '@/lib/tmdb-api'

interface MovieDetailsViewProps {
  title: string
  movieDetails?: TMDBMovieResponse
  onBack: () => void
  onAddToShortlist: () => void
  isPending: boolean
  compact?: boolean
}

export function MovieDetailsView({
  title,
  movieDetails,
  onBack,
  onAddToShortlist,
  isPending,
  compact = false,
}: MovieDetailsViewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-dialog-background flex items-center gap-2.5 pb-3 border-b border-border/40 flex-shrink-0 -mx-1 px-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full h-8 w-8"
        >
          <ArrowLeft className={compact ? 'h-4 w-4' : 'h-4 w-4'} />
        </Button>
        <div className="min-w-0 flex-1">
          <h2
            className={
              compact
                ? 'text-lg font-bold truncate'
                : 'text-xl font-bold truncate'
            }
          >
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">Cast & Crew</p>
        </div>
      </div>

      <div className="space-y-5 pt-4 flex-1 min-h-0">
        {movieDetails?.credits?.cast &&
          movieDetails.credits.cast.length > 0 && (
            <div>
              <h3
                className={`mb-2.5 font-semibold text-sm ${compact ? 'text-sm' : 'text-base'}`}
              >
                Cast
              </h3>
              <div
                className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}
              >
                {movieDetails.credits.cast
                  .slice(0, compact ? 6 : 8)
                  .map((person) => (
                    <div
                      key={person.credit_id}
                      className={`flex gap-2.5 rounded-lg bg-secondary/30 ${compact ? 'p-2' : 'p-2.5'}`}
                    >
                      {person.profile_path ? (
                        <img
                          src={getImageUrl(person.profile_path, 'w185') || ''}
                          alt={person.name}
                          className={
                            compact
                              ? 'h-11 w-11 rounded-md object-cover flex-shrink-0'
                              : 'h-14 w-14 rounded-md object-cover flex-shrink-0'
                          }
                        />
                      ) : (
                        <div
                          className={`rounded-md bg-secondary/50 flex items-center justify-center flex-shrink-0 ${compact ? 'h-11 w-11' : 'h-14 w-14'}`}
                        >
                          <span
                            className={`text-muted-foreground ${compact ? 'text-base' : 'text-lg'}`}
                          >
                            {person.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p
                          className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}
                        >
                          {person.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {person.character}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {movieDetails?.credits?.crew &&
          movieDetails.credits.crew.length > 0 && (
            <div>
              <h3
                className={`mb-2.5 font-semibold text-sm ${compact ? 'text-sm' : 'text-base'}`}
              >
                Key Crew
              </h3>
              <div
                className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}
              >
                {movieDetails.credits.crew
                  .filter((person) =>
                    [
                      'Director',
                      'Writer',
                      'Screenplay',
                      'Producer',
                      'Executive Producer',
                    ].includes(person.job),
                  )
                  .slice(0, compact ? 4 : 6)
                  .map((person) => (
                    <div
                      key={person.credit_id}
                      className={`flex gap-2.5 rounded-lg bg-secondary/30 ${compact ? 'p-2' : 'p-2.5'}`}
                    >
                      {person.profile_path ? (
                        <img
                          src={getImageUrl(person.profile_path, 'w185') || ''}
                          alt={person.name}
                          className={
                            compact
                              ? 'h-11 w-11 rounded-md object-cover flex-shrink-0'
                              : 'h-14 w-14 rounded-md object-cover flex-shrink-0'
                          }
                        />
                      ) : (
                        <div
                          className={`rounded-md bg-secondary/50 flex items-center justify-center flex-shrink-0 ${compact ? 'h-11 w-11' : 'h-14 w-14'}`}
                        >
                          <span
                            className={`text-muted-foreground ${compact ? 'text-base' : 'text-lg'}`}
                          >
                            {person.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p
                          className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}
                        >
                          {person.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {person.job}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {movieDetails?.runtime && (
          <div>
            <h3 className="mb-2 font-semibold text-sm">Additional Info</h3>
            <div className="grid grid-cols-2 gap-2.5 text-sm">
              <div className="rounded-lg bg-secondary/30 p-2.5">
                <p className="text-muted-foreground mb-0.5 text-xs">Runtime</p>
                <p className="font-medium text-sm">
                  {Math.floor(movieDetails.runtime / 60)}h{' '}
                  {movieDetails.runtime % 60}m
                </p>
              </div>
              {movieDetails.budget > 0 && (
                <div className="rounded-lg bg-secondary/30 p-2.5">
                  <p className="text-muted-foreground mb-0.5 text-xs">Budget</p>
                  <p className="font-medium text-sm">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    }).format(movieDetails.budget)}
                  </p>
                </div>
              )}
              {movieDetails.revenue > 0 && (
                <div className="rounded-lg bg-secondary/30 p-2.5">
                  <p className="text-muted-foreground mb-0.5 text-xs">
                    Revenue
                  </p>
                  <p className="font-medium text-sm">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    }).format(movieDetails.revenue)}
                  </p>
                </div>
              )}
              {movieDetails.status && (
                <div className="rounded-lg bg-secondary/30 p-2.5">
                  <p className="text-muted-foreground mb-0.5 text-xs">Status</p>
                  <p className="font-medium text-sm">{movieDetails.status}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          className="gap-2 w-full"
          variant={'primary'}
          loading={isPending}
          disabled={isPending}
          onClick={onAddToShortlist}
        >
          <Plus className="h-4 w-4" />
          Add to Shortlist
        </Button>
      </div>
    </div>
  )
}
