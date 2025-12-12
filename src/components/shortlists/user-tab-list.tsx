import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useSuspenseQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Dices, Users, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Tab, TabsList, TabsPanel, TabsRoot } from '../ui/tabs'
import { EmptyState } from './empty-state'
import { MovieColorBorder } from './movie-color-border'
import { AnimatedMovieWrapper, MovieGrid } from './movie-grid'
import MoviePoster from './movie-poster'
import RaffleCarousel from './raffle-carousel'
import { UserBadge } from './user-badge'

export default function UserTabList({
  onMovieClick,
  raffleState,
  winningMovie,
  onRaffleComplete,
  onRaffleModeToggle,
}: {
  onMovieClick: (movie: any, rect: DOMRect) => void
  raffleState: 'not-started' | 'preview' | 'spinning' | 'winner'
  winningMovie: any
  onRaffleComplete: () => void
  onRaffleModeToggle: () => void
}) {
  const { data: shortlists } = useSuspenseQuery(shortlistQueries.all())
  const [hoveredMovieId, setHoveredMovieId] = useState<string | null>(null)

  const handleMovieClick = (
    movie: any,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    onMovieClick(movie, rect)
  }

  const participatingMovies = shortlists
    .filter((s) => s.participating)
    .flatMap((s) => s.movies)

  return (
    <TabsRoot variant="underlined" defaultValue="all" className="w-full">
      <div className="flex items-center justify-between mb-6">
        <TabsList
          variant="underlined"
          className="flex-1 border-b border-border"
        >
          <Tab
            variant="underlined"
            value="all"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span>All</span>
            <span className="text-xs text-muted-foreground ml-1">
              ({shortlists.reduce((acc, s) => acc + s.movies.length, 0)})
            </span>
          </Tab>
          {shortlists.map((shortlist) => (
            <Tab
              key={shortlist.user.id}
              variant="underlined"
              value={shortlist.user.id}
              className="flex items-center gap-2 relative"
            >
              {shortlist.user.image && (
                <div className="relative w-6 h-6">
                  <img
                    src={shortlist.user.image}
                    alt={shortlist.user.name.charAt(0)}
                    className={`absolute inset-0.5 w-5 h-5 border border-border rounded-full transition-opacity duration-300 ${
                      !shortlist.participating ? 'opacity-40 grayscale' : ''
                    }`}
                  />
                  {!shortlist.participating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-destructive drop-shadow-md" />
                    </div>
                  )}
                  {shortlist.isReady && shortlist.participating && (
                    <div className="absolute -top-1 -right-1 bg-background rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success drop-shadow-sm" />
                    </div>
                  )}
                </div>
              )}
              <span
                className={`text-sm font-medium transition-colors ${
                  !shortlist.participating
                    ? 'text-muted-foreground/50 line-through'
                    : shortlist.isReady
                      ? 'text-success'
                      : ''
                }`}
              >
                {shortlist.user.name}
              </span>
              <span
                className={`text-xs ml-1 transition-colors ${
                  !shortlist.participating
                    ? 'text-muted-foreground/40'
                    : shortlist.isReady
                      ? 'text-success-foreground/70'
                      : 'text-muted-foreground'
                }`}
              >
                ({shortlist.movies.length})
              </span>
            </Tab>
          ))}
        </TabsList>
        <Button
          onClick={onRaffleModeToggle}
          variant={raffleState !== 'not-started' ? 'primary' : 'secondary'}
          className={`ml-6 rounded-full ${
            raffleState !== 'not-started' ? 'shadow-lg shadow-primary/30' : ''
          }`}
          aria-label="Toggle Raffle Mode"
        >
          <Dices className="h-4 w-4" />
          <span className="text-sm font-medium">
            {raffleState !== 'not-started' ? 'Exit Raffle' : 'Raffle'}
          </span>
        </Button>
      </div>

      <TabsPanel variant="underlined" value="all">
        <div className="overflow-y-auto max-h-[calc(100vh-14rem)] no-scrollbar p-5 fade-mask fade-y-5 dark:fade-y-5 fade-intensity-100">
          <AnimatePresence mode="wait">
            {raffleState === 'not-started' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MovieGrid columns={6}>
                  {shortlists.flatMap((shortlist, shortlistIndex) =>
                    shortlist.movies.map((movie, movieIndex) => {
                      const isFirstMovieForUser = movieIndex === 0
                      const delay =
                        (shortlistIndex * shortlist.movies.length +
                          movieIndex) *
                        0.02
                      return (
                        <AnimatedMovieWrapper
                          key={`${shortlist.user.id}-${movie.id}`}
                          delay={delay}
                        >
                          {isFirstMovieForUser && (
                            <UserBadge
                              imageUrl={shortlist.user.image}
                              name={shortlist.user.name}
                            />
                          )}
                          <MovieColorBorder colorIndex={shortlistIndex} />
                          <MoviePoster
                            movie={movie}
                            movieIndex={movieIndex}
                            handleMovieClick={handleMovieClick}
                            hoveredMovieId={hoveredMovieId}
                            setHoveredMovieId={setHoveredMovieId}
                          />
                        </AnimatedMovieWrapper>
                      )
                    }),
                  )}
                </MovieGrid>
              </motion.div>
            ) : (
              <motion.div
                key="raffle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <RaffleCarousel
                  raffleState={raffleState}
                  movies={participatingMovies}
                  winningMovie={winningMovie}
                  onRaffleComplete={onRaffleComplete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TabsPanel>

      {shortlists.map((shortlist) => (
        <TabsPanel
          key={shortlist.user.id}
          variant="underlined"
          value={shortlist.user.id}
        >
          <div className="overflow-y-auto max-h-[calc(100vh-16rem)] pr-2">
            {shortlist.movies.length > 0 ? (
              <MovieGrid columns={3}>
                {shortlist.movies.map((movie, movieIndex) => (
                  <MoviePoster
                    key={movie.id}
                    movie={movie}
                    movieIndex={movieIndex}
                    handleMovieClick={handleMovieClick}
                    hoveredMovieId={hoveredMovieId}
                    setHoveredMovieId={setHoveredMovieId}
                  />
                ))}
              </MovieGrid>
            ) : (
              <EmptyState />
            )}
          </div>
        </TabsPanel>
      ))}
    </TabsRoot>
  )
}
