import { cn } from '@/lib/utils'
import { User, Users } from 'lucide-react'

export type FilterScope = 'everyone' | 'mine'

export function ScopeToggle({
  value,
  onChange,
}: {
  value: FilterScope
  onChange: (v: FilterScope) => void
}) {
  return (
    <div className="inline-flex items-center rounded-lg bg-muted p-1 gap-0.5">
      <button
        type="button"
        onClick={() => onChange('everyone')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer',
          value === 'everyone'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Users className="h-3.5 w-3.5" />
        Everyone
      </button>
      <button
        type="button"
        onClick={() => onChange('mine')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer',
          value === 'mine'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <User className="h-3.5 w-3.5" />
        My Movies
      </button>
    </div>
  )
}
