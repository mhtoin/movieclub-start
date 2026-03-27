import { Clapperboard } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Clapperboard className="w-7 h-7 text-muted-foreground/60" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">
        No movies shortlisted
      </p>
      <p className="text-xs text-muted-foreground max-w-[200px]">
        Use the toolbar to add movies you want to watch
      </p>
    </div>
  )
}
