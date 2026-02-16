import {
  useToggleIsReadyMutation,
  useToggleParticipatingMutation,
} from '@/lib/react-query/mutations/shortlist'
import { shortlistQueries } from '@/lib/react-query/queries/shortlist'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Film, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { AddMovieDialog } from './add-movie-dialog'
import ShortlistItem from './shortlist-item'

interface ShortlistToolbarProps {
  userId: string
}

const panelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 28,
      stiffness: 380,
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: 16,
    scale: 0.97,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 400,
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 350 },
  },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
}

export function ShortlistToolbar({ userId }: ShortlistToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data, isLoading } = useQuery(shortlistQueries.byUser(userId))
  const toggleIsReadyMutation = useToggleIsReadyMutation()
  const toggleParticipatingMutation = useToggleParticipatingMutation()

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
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              className="absolute bottom-[calc(100%+0.75rem)] right-0 w-[calc(100vw-2rem)] sm:w-[380px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl origin-bottom-right"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="p-5">
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Film className="w-[18px] h-[18px] text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold tracking-tight text-foreground">
                        My Shortlist
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {movieCount === 0
                          ? 'No movies added'
                          : `${movieCount}/3 movie${movieCount === 1 ? '' : 's'}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </motion.div>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        variants={itemVariants}
                        className="animate-pulse bg-accent/30 rounded-lg h-[88px]"
                      />
                    ))}
                  </div>
                ) : movieCount === 0 ? (
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center py-8 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-3">
                      <Sparkles className="w-8 h-8 text-primary/30" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      No movies yet
                    </p>
                    <p className="text-xs text-muted-foreground mb-5">
                      Add up to 3 movies to your shortlist
                    </p>
                    <div className="w-full">
                      <AddMovieDialog movieCount={movieCount} />
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {data?.requiresSelection &&
                      data?.selectedIndex === null && (
                        <motion.div
                          variants={itemVariants}
                          className="p-2.5 rounded-lg bg-primary/10 border border-primary/20"
                        >
                          <p className="text-xs font-medium text-primary">
                            Select one movie for the raffle
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            You won last time — choose which to include.
                          </p>
                        </motion.div>
                      )}
                    <AnimatePresence initial={false}>
                      {data?.movies?.map((movie, index) => (
                        <motion.div key={movie.id} variants={itemVariants}>
                          <ShortlistItem
                            movie={movie}
                            index={index}
                            requiresSelection={
                              data?.requiresSelection ?? undefined
                            }
                            selectedIndex={data?.selectedIndex ?? undefined}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {canAddMoreMovies && (
                      <motion.div
                        key="add-movie"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <AddMovieDialog movieCount={movieCount} />
                      </motion.div>
                    )}
                  </div>
                )}

                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-2 mt-4 pt-3 border-t border-border/40"
                >
                  <button
                    onClick={handleToggleParticipating}
                    disabled={toggleParticipatingMutation.isPending}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      data?.participating
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'bg-accent/50 text-muted-foreground border border-transparent hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${data?.participating ? 'bg-primary' : 'bg-muted-foreground/40'}`}
                    />
                    {data?.participating ? 'Participating' : 'Sitting out'}
                  </button>

                  <button
                    onClick={handleToggleReady}
                    disabled={toggleIsReadyMutation.isPending}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      data?.isReady
                        ? 'bg-success/15 text-success border border-success/30'
                        : 'bg-accent/50 text-muted-foreground border border-transparent hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${data?.isReady ? 'bg-success' : 'bg-muted-foreground/40'}`}
                    />
                    {data?.isReady ? 'Ready' : 'Not ready'}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors duration-200 ${
            isExpanded
              ? 'bg-accent text-foreground shadow-lg'
              : 'bg-primary text-primary-foreground hover:shadow-primary/30 hover:shadow-2xl'
          }`}
          aria-label={isExpanded ? 'Close shortlist' : 'Open shortlist'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="film"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Film className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!isExpanded && movieCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-background"
              >
                {movieCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  )
}
