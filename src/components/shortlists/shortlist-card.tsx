import { getImageUrl } from '@/lib/tmdb-api'
import { useState } from 'react'

interface ShortlistCardProps {
  shortlist: {
    id: string
    userId: string
    isReady: boolean
    participating: boolean
    user: {
      id: string
      name: string
      image: string
      email: string
    }
    movies: Array<{
      id: string
      tmdbId: number
      title: string
      originalTitle: string
      overview: string
      releaseDate: string
      voteAverage: number
      voteCount: number
      runtime?: number | null
      genres?: string[] | null
      tagline?: string | null
      images?: {
        backdrops?: Array<{ file_path: string; [key: string]: any }>
        posters?: Array<{ file_path: string; [key: string]: any }>
        logos?: Array<{ file_path: string; [key: string]: any }>
      } | null
    }>
  }
  index: number
  onMovieClick: (movie: any, rect: DOMRect) => void
}

export function ShortlistCard({
  shortlist,
  index,
  onMovieClick,
}: ShortlistCardProps) {
  const [hoveredMovieId, setHoveredMovieId] = useState<string | null>(null)

  const getStatusColor = () => {
    if (!shortlist.participating) {
      return 'bg-muted/50 text-muted-foreground'
    }
    if (shortlist.isReady) {
      return 'bg-primary/10 text-primary border-primary/20'
    }
    return 'bg-secondary/10 text-secondary border-secondary/20'
  }

  const getStatusText = () => {
    if (!shortlist.participating) return 'Not Participating'
    if (shortlist.isReady) return 'Ready'
    return 'In Progress'
  }

  const handleMovieClick = (
    movie: any,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    onMovieClick(movie, rect)
  }

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full flex flex-col animate-fade-in-up"
      style={{
        animationDelay: `${index * 0.05}s`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-secondary/5 pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10 border-b border-border pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={shortlist.user.image}
              alt={shortlist.user.name}
              className="w-10 h-10 rounded-full border-2 border-border shadow-md"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">
              {shortlist.user.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {shortlist.movies.length}{' '}
              {shortlist.movies.length === 1 ? 'movie' : 'movies'}
            </p>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium border shadow-sm flex-shrink-0 ${getStatusColor()}`}
        >
          {getStatusText()}
        </div>
      </div>
      {shortlist.movies.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 relative z-10">
          {shortlist.movies.map((movie, movieIndex) => {
            const posterPath = movie.images?.posters?.[0]?.file_path
            const posterUrl = posterPath
              ? getImageUrl(posterPath, 'w342')
              : null

            return (
              <div
                key={movie.id}
                className="relative group cursor-pointer animate-scale-in"
                style={{
                  animationDelay: `${movieIndex * 0.05}s`,
                }}
                onClick={(e) => handleMovieClick(movie, e)}
                onMouseEnter={() => setHoveredMovieId(movie.id)}
                onMouseLeave={() => setHoveredMovieId(null)}
              >
                <div className="aspect-[2/3] relative overflow-hidden rounded-md border border-border shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:border-primary/50">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="text-center p-2">
                        <div className="text-2xl mb-1">🎬</div>
                        <p className="text-[0.65rem] text-muted-foreground line-clamp-2">
                          {movie.title}
                        </p>
                      </div>
                    </div>
                  )}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
                      hoveredMovieId === movie.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-semibold line-clamp-2">
                        {movie.title}
                      </p>
                      {movie.releaseDate && (
                        <p className="text-white/80 text-[0.65rem] mt-0.5">
                          {new Date(movie.releaseDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground relative z-10">
          <div className="text-3xl mb-2 opacity-50">📽️</div>
          <p className="text-sm">No movies yet</p>
        </div>
      )}
    </div>
  )
}
