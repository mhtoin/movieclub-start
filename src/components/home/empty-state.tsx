import { Film, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function EmptyState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-sm text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
          <Film className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            No movies yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Start building your watchlist by discovering movies to add.
          </p>
        </div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Discover movies
        </Link>
      </div>
    </div>
  )
}
