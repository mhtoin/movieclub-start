import { Movie } from '@/db/schema/movies'
import { motion } from 'framer-motion'
import { Clapperboard } from 'lucide-react'
import { useState } from 'react'
import MoviePoster from './movie-poster'

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
    movies: Array<Movie>
  }
  index: number
  onMovieClick: (movie: any, rect: DOMRect) => void
  raffleState: 'not-started' | 'preview' | 'spinning' | 'winner'
}

export function ShortlistCard({
  shortlist,
  index,
  onMovieClick,
  raffleState,
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

  const isCollapsed = raffleState !== 'not-started'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.3 },
        y: { duration: 0.5, delay: index * 0.05 },
        borderRadius: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      }}
      className={`flex bg-card border border-border shadow-md hover:shadow-xl max-w-sm transition-shadow duration-300 relative overflow-hidden ${
        isCollapsed ? 'rounded-2xl p-4' : 'rounded-lg p-4 h-full flex flex-col'
      }`}
    >
      {isCollapsed ? (
        <motion.div
          layout
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative flex-shrink-0">
            <img
              src={shortlist.user.image}
              alt={shortlist.user.name}
              className="w-10 h-10 rounded-full border-2 border-border shadow-md"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {shortlist.user.name}
            </span>
            <div className="flex items-center text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
              <span className="text-xs">{shortlist.movies.length}</span>
              <Clapperboard className="h-4 w-4 ml-1 text-muted-foreground" />
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-secondary/5 pointer-events-none" />

          <motion.div
            layout
            className="flex items-center justify-between mb-4 relative z-10 border-b border-border pb-2"
          >
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
          </motion.div>
          {shortlist.movies.length > 0 ? (
            <motion.div layout className="grid grid-cols-3 gap-2 relative z-10">
              {shortlist.movies.map((movie, movieIndex) => {
                return (
                  <MoviePoster
                    key={movie.id}
                    movie={movie}
                    movieIndex={movieIndex}
                    handleMovieClick={handleMovieClick}
                    hoveredMovieId={hoveredMovieId}
                    setHoveredMovieId={setHoveredMovieId}
                  />
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              layout
              className="text-center py-8 text-muted-foreground relative z-10"
            >
              <div className="text-3xl mb-2 opacity-50">📽️</div>
              <p className="text-sm">No movies yet</p>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
