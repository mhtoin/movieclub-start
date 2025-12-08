import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useSuspenseQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Dices, Users } from 'lucide-react'
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
              className="flex items-center gap-2"
            >
              {shortlist.user.image && (
                <img
                  src={shortlist.user.image}
                  alt={shortlist.user.name.charAt(0)}
                  className="w-5 h-5 rounded-full"
                />
              )}
              <span>{shortlist.user.name}</span>
              <span className="text-xs text-muted-foreground">
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
                      (shortlistIndex * shortlist.movies.length + movieIndex) *
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
                movies={shortlists.flatMap((shortlist) => shortlist.movies)}
                winningMovie={winningMovie}
                onRaffleComplete={onRaffleComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </TabsPanel>

      {shortlists.map((shortlist) => (
        <TabsPanel
          key={shortlist.user.id}
          variant="underlined"
          value={shortlist.user.id}
        >
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
        </TabsPanel>
      ))}
    </TabsRoot>
  )
}
