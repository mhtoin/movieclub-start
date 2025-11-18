import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { Tabs } from '@base-ui-components/react/tabs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { EmptyState } from './empty-state'
import { MovieColorBorder } from './movie-color-border'
import { AnimatedMovieWrapper, MovieGrid } from './movie-grid'
import MoviePoster from './movie-poster'
import RaffleCarousel from './raffle-carousel'
import { RaffleControlTab } from './raffle-control-tab'
import { UserBadge } from './user-badge'
import { UserTabButton } from './user-tab-button'

export default function UserTabList({
  onMovieClick,
  raffleState,
  winningMovie,
  onRaffleComplete,
  onStartRaffle,
}: {
  onMovieClick: (movie: any, rect: DOMRect) => void
  raffleState: any
  winningMovie: any
  onRaffleComplete: () => void
  onStartRaffle?: () => void
}) {
  const { data: shortlists } = useSuspenseQuery(shortlistQueries.all())
  const [hoveredMovieId, setHoveredMovieId] = useState<string | null>(null)
  const [watchDate, setWatchDate] = useState<Date | undefined>(undefined)

  const handleMovieClick = (
    movie: any,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    onMovieClick(movie, rect)
  }
  return (
    <Tabs.Root className="rounded-md " defaultValue="all">
      <Tabs.List className="relative z-0  gap-5 px-5 flex ">
        <div className="flex flex-col gap-3 mb-4">
          <AnimatePresence mode="wait">
            {raffleState === 'not-started' ? (
              <UserTabButton
                key="all"
                value="all"
                name="All Users"
                movieCount={shortlists.reduce(
                  (acc, s) => acc + s.movies.length,
                  0,
                )}
                isAllUsers
              />
            ) : (
              <RaffleControlTab
                key="raffle-control"
                value="all"
                onStartRaffle={() => onStartRaffle?.()}
                onDateSelect={setWatchDate}
                selectedDate={watchDate}
              />
            )}
          </AnimatePresence>
          {shortlists.map((shortlist, index) => (
            <UserTabButton
              key={shortlist.user.id}
              value={shortlist.user.id}
              name={shortlist.user.name}
              imageUrl={shortlist.user.image}
              index={index + 1}
              movieCount={shortlist.movies.length}
            />
          ))}
        </div>
        <div className="flex flex-col gap-3 p-5 border border-border rounded-2xl w-full flex-1 h-full">
          <Tabs.Panel key={'all'} value={'all'} className="w-full">
            {raffleState === 'not-started' ? (
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
            ) : (
              <div className="w-full">
                <RaffleCarousel
                  raffleState={raffleState}
                  movies={shortlists.flatMap((shortlist) => shortlist.movies)}
                  winningMovie={winningMovie}
                  onRaffleComplete={onRaffleComplete}
                />
              </div>
            )}
          </Tabs.Panel>
          {shortlists.map((shortlist) => (
            <Tabs.Panel
              key={shortlist.user.id}
              className="relative flex items-center justify-center "
              value={shortlist.user.id}
            >
              {shortlist.movies.length > 0 ? (
                <MovieGrid columns={3}>
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
                </MovieGrid>
              ) : (
                <EmptyState />
              )}
            </Tabs.Panel>
          ))}
        </div>
      </Tabs.List>
    </Tabs.Root>
  )
}
