import { ArrowRight, Clapperboard } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  actionText?: string
  actionHref?: string
}

export function EmptyState({
  title = 'No movie picked yet',
  description = 'Your club is ready for its next movie night. Time to pick something great!',
  actionText = 'Find a movie',
  actionHref = '/discover',
}: EmptyStateProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="max-w-sm text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30">
            <Clapperboard className="h-10 w-10 text-primary opacity-60" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <a
          href={actionHref}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          {actionText}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
