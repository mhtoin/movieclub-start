import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Film, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import ShortlistItem from './shortlist-item'

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
                    return (
                      <ShortlistItem
                        key={movie.id}
                        movie={movie}
                        index={index}
                      />
                    )
                  })}
                </div>
              )}
            </div>
            {movieCount > 0 && (
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        data?.isReady
                          ? 'bg-green-500 shadow-lg shadow-green-500/50'
                          : 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
                      }`}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {data?.isReady ? 'Ready to Watch' : 'In Progress'}
                    </span>
                  </div>
                  {data?.participating && (
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
