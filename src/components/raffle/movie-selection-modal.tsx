import { TicketMovieRow } from '@/components/ticket/ticket-movie-row'
import type { ShortlistWithUserMovies } from '@/db/schema'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface MovieSelectionModalProps {
  shortlist: ShortlistWithUserMovies | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (index: number) => void
  isLoading?: boolean
}

export function MovieSelectionModal({
  shortlist,
  open,
  onOpenChange,
  onSelect,
  isLoading = false,
}: MovieSelectionModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onOpenChange])

  if (!shortlist || typeof document === 'undefined') return null

  const { movies, user, selectedIndex } = shortlist

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />

          <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={() => onOpenChange(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 400,
                mass: 0.8,
              }}
              className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-border bg-muted flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Select a Movie
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      for {user.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="px-6 py-3 bg-primary/10 border-b border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-primary">
                    {user.name} won last time and can only include 1 movie in
                    the raffle. Select which movie to include.
                  </p>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {movies.map((movie, index) => {
                  const isSelected = selectedIndex === index
                  return (
                    <motion.button
                      key={movie.id}
                      onClick={() => !isLoading && onSelect(index)}
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      className={`w-full text-left transition-all duration-200 ${
                        isLoading
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer'
                      }`}
                    >
                      <div
                        className={`relative rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border/60 bg-card hover:border-border hover:bg-accent/50'
                        }`}
                      >
                        <TicketMovieRow
                          movie={movie}
                          isSelected={isSelected}
                          showSelection={true}
                        />
                      </div>
                    </motion.button>
                  )
                })}
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {selectedIndex !== null
                      ? `${movies[selectedIndex]?.title} will be included in the raffle`
                      : 'Click a movie to select it'}
                  </p>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
