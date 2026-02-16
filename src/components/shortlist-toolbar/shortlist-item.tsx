import { Movie } from '@/db/schema/movies'
import { useRemoveFromShortlistMutation } from '@/lib/react-query/mutations/shortlist'
import { motion } from 'framer-motion'
import { Clock, Film, Maximize2, Star, X } from 'lucide-react'
import { useState } from 'react'
import { ShortlistItemDialog } from './shortlist-item-dialog'

export default function ShortlistItem({
  movie,
  index,
  requiresSelection,
  selectedIndex,
}: {
  movie: Movie
  index: number
  requiresSelection?: boolean
  selectedIndex?: number | null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const removeFromShortlistMutation = useRemoveFromShortlistMutation()
  const isSelected = requiresSelection && selectedIndex === index
  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null
  const genres = movie.genres?.slice(0, 2) ?? []
  const layoutId = `shortlist-item-${movie.id}`

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false) // Close dialog if open
    removeFromShortlistMutation.mutate(movie.id)
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(true)
  }

  return (
    <>
      <motion.div
        layoutId={layoutId}
        layout
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 350,
        }}
        className={`group relative flex gap-3 p-3 rounded-lg border overflow-hidden transition-colors duration-200 ${
          isSelected
            ? 'border-primary/50 bg-primary/5 shadow-sm'
            : 'border-border/60 bg-card/50'
        }`}
      >
        {/* Remove button */}
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 z-10 p-1 rounded-md bg-card/80 hover:bg-destructive/10 border border-border/40 hover:border-destructive/30 text-muted-foreground hover:text-destructive transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Remove from shortlist"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="relative flex-shrink-0 w-12 h-[72px] rounded-md overflow-hidden bg-muted shadow-sm">
          {movie.images?.posters?.[0]?.file_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${movie.images.posters[0].file_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-5 h-5 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-md" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h3 className="text-sm font-medium text-foreground truncate leading-tight">
              {movie.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              {year && <span>{year}</span>}
              {year && movie.runtime && <span className="text-border">·</span>}
              {movie.runtime && (
                <span className="inline-flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {movie.runtime}m
                </span>
              )}
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {movie.voteAverage.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-1.5">
            <div className="flex items-center gap-1">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium leading-none"
                >
                  {genre}
                </span>
              ))}
            </div>
            {/* Expand button */}
            <button
              type="button"
              onClick={handleExpand}
              className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors duration-200"
              aria-label="View details"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {isSelected && (
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-primary shadow-sm" />
        )}
      </motion.div>

      <ShortlistItemDialog
        movie={movie}
        open={isOpen}
        onOpenChange={setIsOpen}
        layoutId={layoutId}
        requiresSelection={requiresSelection}
        selectedIndex={selectedIndex}
        index={index}
      />
    </>
  )
}
