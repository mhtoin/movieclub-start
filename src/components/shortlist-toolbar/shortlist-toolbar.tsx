import {
  useToggleIsReadyMutation,
  useToggleParticipatingMutation,
} from '@/lib/react-query/mutations/shortlist'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Film, Sparkles, X } from 'lucide-react'
import { Suspense, useState } from 'react'
import { AddMovieDialog } from './add-movie-dialog'
import ShortlistItem from './shortlist-item'

interface ShortlistToolbarProps {
  userId: string
}

export function ShortlistToolbar({ userId }: ShortlistToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data, isLoading } = useQuery(shortlistQueries.byUser(userId))
  const toggleIsReadyMutation = useToggleIsReadyMutation()
  const toggleParticipatingMutation = useToggleParticipatingMutation()
  const [sortBy, setSortBy] = useState('popularity.desc')

  const movieCount = data?.movies?.length || 0
  const canAddMoreMovies = movieCount < 3

  const handleToggleReady = () => {
    if (data) {
      toggleIsReadyMutation.mutate(!data.isReady)
    }
  }

  const handleToggleParticipating = () => {
    if (data) {
      toggleParticipatingMutation.mutate(!data.participating)
    }
  }

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <div
          className={`absolute bottom-0 right-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl transition-all duration-500 ease-out overflow-hidden ${
            isExpanded
              ? 'w-[95vw] max-w-[420px] h-[85vh] max-h-[650px] opacity-100 scale-100 mb-16 sm:mb-20'
              : 'w-0 h-0 max-w-[420px] opacity-0 scale-75 pointer-events-none'
          }`}
        >
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                  <Film className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    My Shortlist
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {movieCount === 0
                      ? 'No movies yet'
                      : `${movieCount} movie${movieCount === 1 ? '' : 's'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors group"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto -mx-2 px-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-accent/50 rounded-2xl h-32"
                    />
                  ))}
                </div>
              ) : movieCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                    <Sparkles className="w-12 h-12 text-primary/40" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    No movies yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Start building your shortlist
                  </p>
                  <div className="w-full">
                    <Suspense fallback={null}>
                      <AddMovieDialog movieCount={movieCount} />
                    </Suspense>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.requiresSelection && data?.selectedIndex === null && (
                    <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <p className="text-sm font-medium text-primary">
                        Select one movie for the raffle
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You won last time! Choose which movie to include.
                      </p>
                    </div>
                  )}
                  {data?.movies?.map((movie, index) => {
                    return (
                      <ShortlistItem
                        key={movie.id}
                        movie={movie}
                        index={index}
                        requiresSelection={data?.requiresSelection ?? undefined}
                        selectedIndex={data?.selectedIndex ?? undefined}
                      />
                    )
                  })}
                  {canAddMoreMovies && (
                    <Suspense fallback={null}>
                      <AddMovieDialog movieCount={movieCount} />
                    </Suspense>
                  )}
                </div>
              )}
            </div>
            {movieCount > 0 && (
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="space-y-3">
                  <button
                    onClick={handleToggleReady}
                    disabled={toggleIsReadyMutation.isPending}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full transition-all ${
                          data?.isReady
                            ? 'bg-success shadow-lg shadow-success/50'
                            : 'bg-muted-foreground/50 shadow-lg shadow-muted-foreground/20'
                        }`}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {data?.isReady ? 'Ready to Watch' : 'In Progress'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Click to toggle
                    </span>
                  </button>

                  <button
                    onClick={handleToggleParticipating}
                    disabled={toggleParticipatingMutation.isPending}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full transition-all ${
                          data?.participating
                            ? 'bg-primary shadow-lg shadow-primary/50'
                            : 'bg-muted-foreground/30'
                        }`}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {data?.participating
                          ? 'Participating'
                          : 'Not Participating'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Click to toggle
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary/90 text-primary-foreground rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group ${
            isExpanded
              ? 'w-14 h-14 scale-95'
              : 'w-16 h-16 hover:scale-110 hover:shadow-primary/50'
          }`}
          aria-label={isExpanded ? 'Collapse shortlist' : 'Expand shortlist'}
        >
          {!isExpanded && movieCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg shadow-red-500/50 ring-2 ring-background animate-pulse">
              {movieCount}
            </span>
          )}
          <div className="relative">
            {isExpanded ? (
              <ChevronDown className="w-6 h-6 transition-transform group-hover:translate-y-0.5" />
            ) : (
              <Film className="w-7 h-7 transition-transform group-hover:-translate-y-0.5" />
            )}
          </div>
          {!isExpanded && (
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          )}
        </button>
      </div>
    </>
  )
}
