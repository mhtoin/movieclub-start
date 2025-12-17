import { Button } from '@/components/ui/button'
import { getImageUrl } from '@/lib/tmdb-api'
import { TMDBMovieResponse } from '@/types/tmdb'
import { ArrowLeft, Plus } from 'lucide-react'

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
      <div className="sticky top-0 z-10 bg-dialog-background flex items-center gap-3 pb-4 border-b border-border/50 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </Button>
        <div>
          <h2 className={compact ? 'text-lg font-bold' : 'text-2xl font-bold'}>
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">Cast & Crew</p>
        </div>
      </div>

      <div className="space-y-4 pt-4 flex-1 min-h-0">
        {movieDetails?.credits?.cast &&
          movieDetails.credits.cast.length > 0 && (
            <div>
              <h3
                className={`mb-3 font-semibold ${compact ? 'text-base' : 'text-lg'}`}
              >
                Cast
              </h3>
              <div
                className={`grid gap-3 ${compact ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-2'}`}
              >
                {movieDetails.credits.cast
                  .slice(0, compact ? 6 : 10)
                  .map((person) => (
                    <div
                      key={person.credit_id}
                      className={`flex gap-3 rounded-lg bg-secondary/30 ${compact ? 'p-2' : 'p-3'}`}
                    >
                      {person.profile_path ? (
                        <img
                          src={getImageUrl(person.profile_path, 'w185') || ''}
                          alt={person.name}
                          className={
                            compact
                              ? 'h-12 w-12 rounded-md object-cover'
                              : 'h-16 w-16 rounded-lg object-cover'
                          }
                        />
                      ) : (
                        <div
                          className={`rounded-lg bg-secondary/50 flex items-center justify-center ${compact ? 'h-12 w-12 rounded-md' : 'h-16 w-16'}`}
                        >
                          <span
                            className={`text-muted-foreground ${compact ? 'text-lg' : 'text-2xl'}`}
                          >
                            {person.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
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
                className={`mb-3 font-semibold ${compact ? 'text-base' : 'text-lg'}`}
              >
                Key Crew
              </h3>
              <div
                className={`grid gap-3 ${compact ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-2'}`}
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
                  .slice(0, compact ? 4 : 8)
                  .map((person) => (
                    <div
                      key={person.credit_id}
                      className={`flex gap-3 rounded-lg bg-secondary/30 ${compact ? 'p-2' : 'p-3'}`}
                    >
                      {person.profile_path ? (
                        <img
                          src={getImageUrl(person.profile_path, 'w185') || ''}
                          alt={person.name}
                          className={
                            compact
                              ? 'h-12 w-12 rounded-md object-cover'
                              : 'h-16 w-16 rounded-lg object-cover'
                          }
                        />
                      ) : (
                        <div
                          className={`rounded-lg bg-secondary/50 flex items-center justify-center ${compact ? 'h-12 w-12 rounded-md' : 'h-16 w-16'}`}
                        >
                          <span
                            className={`text-muted-foreground ${compact ? 'text-lg' : 'text-2xl'}`}
                          >
                            {person.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
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
            <h3 className="mb-2 font-semibold">Additional Info</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-secondary/30 p-3">
                <p className="text-muted-foreground mb-1">Runtime</p>
                <p className="font-medium">
                  {Math.floor(movieDetails.runtime / 60)}h{' '}
                  {movieDetails.runtime % 60}m
                </p>
              </div>
              {movieDetails.budget > 0 && (
                <div className="rounded-lg bg-secondary/30 p-3">
                  <p className="text-muted-foreground mb-1">Budget</p>
                  <p className="font-medium">
                    ${(movieDetails.budget / 1000000).toFixed(0)}M
                  </p>
                </div>
              )}
              {movieDetails.revenue > 0 && (
                <div className="rounded-lg bg-secondary/30 p-3">
                  <p className="text-muted-foreground mb-1">Revenue</p>
                  <p className="font-medium">
                    ${(movieDetails.revenue / 1000000).toFixed(0)}M
                  </p>
                </div>
              )}
              {movieDetails.status && (
                <div className="rounded-lg bg-secondary/30 p-3">
                  <p className="text-muted-foreground mb-1">Status</p>
                  <p className="font-medium">{movieDetails.status}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          className="gap-2 w-full"
          variant={'primary'}
          loading={isPending}
          onClick={onAddToShortlist}
        >
          <Plus className="h-4 w-4" />
          Add to Shortlist
        </Button>
      </div>
    </div>
  )
}
