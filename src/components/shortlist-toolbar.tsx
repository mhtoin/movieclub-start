import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Film, Sparkles, X } from 'lucide-react'
import { useState } from 'react'

interface ShortlistToolbarProps {
  userId: string
}

export function ShortlistToolbar({ userId }: ShortlistToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data, isLoading } = useQuery(shortlistQueries.byUser(userId))

  const movieCount = data?.movies?.length || 0

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}
      <div className="fixed bottom-6 right-6 z-50">
        <div
          className={`absolute bottom-0 right-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl transition-all duration-500 ease-out overflow-hidden ${
            isExpanded
              ? 'w-[420px] h-[650px] opacity-100 scale-100 mb-20'
              : 'w-0 h-0 opacity-0 scale-75 pointer-events-none'
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
                    Start Your Collection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add movies to your shortlist and plan your next movie night!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.movies?.map((movie, index) => {
                    const backdropPath = movie.images?.backdrops?.[0]?.file_path
                    const hasBackdrop = Boolean(backdropPath)

                    return (
                      <div
                        key={movie.id}
                        className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        {hasBackdrop ? (
                          <>
                            <div className="absolute inset-0">
                              <img
                                src={`https://image.tmdb.org/t/p/w500${backdropPath}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/60 group-hover:from-black/85 group-hover:via-black/75 group-hover:to-black/65 transition-all duration-300" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-accent/50 to-accent/30 group-hover:from-accent group-hover:to-accent/50 transition-all duration-300" />
                        )}

                        <div className="relative flex gap-4 p-4">
                          <div className="relative flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden shadow-md">
                            {movie.images?.posters?.[0]?.file_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w200${movie.images.posters[0].file_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                <Film className="w-8 h-8 text-muted-foreground/50" />
                              </div>
                            )}
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-semibold text-sm mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-snug ${hasBackdrop ? 'text-white' : ''}`}
                            >
                              {movie.title}
                            </h3>
                            <p
                              className={`text-xs mb-2 ${hasBackdrop ? 'text-white/70' : 'text-muted-foreground'}`}
                            >
                              {movie.releaseDate
                                ? new Date(movie.releaseDate).getFullYear()
                                : 'N/A'}
                            </p>
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${hasBackdrop ? 'bg-yellow-500/20 backdrop-blur-sm' : 'bg-yellow-500/10'}`}
                              >
                                <span className="text-yellow-500">★</span>
                                <span
                                  className={`font-medium ${hasBackdrop ? 'text-white' : 'text-foreground'}`}
                                >
                                  {movie.voteAverage.toFixed(1)}
                                </span>
                              </div>
                              {movie.runtime && (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${hasBackdrop ? 'text-white/80 bg-white/10 backdrop-blur-sm' : 'text-muted-foreground bg-accent/50'}`}
                                >
                                  {movie.runtime} min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            {data?.shortlist && movieCount > 0 && (
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        data.shortlist.isReady
                          ? 'bg-green-500 shadow-lg shadow-green-500/50'
                          : 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
                      }`}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {data.shortlist.isReady
                        ? 'Ready to Watch'
                        : 'In Progress'}
                    </span>
                  </div>
                  {data.shortlist.participating && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      Participating
                    </span>
                  )}
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
