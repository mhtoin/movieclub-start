import { Film, History } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function WatchedEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <History className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        No watch history yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Movies you watch will appear here as a timeline. Start by discovering
        your next favorite film.
      </p>
      <Link
        to="/discover"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Film className="size-4" />
        Discover Movies
      </Link>
    </div>
  )
}
