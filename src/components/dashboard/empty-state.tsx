import { ArrowRight, Film, Search } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  actionText?: string
  actionHref?: string
}

export function EmptyState({
  title = 'No Upcoming Movies',
  description = 'All movies in your collection have been watched.',
  actionText = 'Discover Movies',
  actionHref = '/discover',
}: EmptyStateProps) {
  return (
    <div className="h-full rounded-lg border bg-card flex items-center justify-center p-12">
      <div className="max-w-md space-y-6 text-center">
        <div className="relative">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Film className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1">
            <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
              <Search className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>

        <a
          href={actionHref}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {actionText}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
