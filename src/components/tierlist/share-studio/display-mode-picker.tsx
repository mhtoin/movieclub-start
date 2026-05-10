import { AlignVerticalSpaceAround, Grid3X3, List } from 'lucide-react'
import type { DisplayMode } from './types'

export function DisplayModePicker({
  value,
  onChange,
}: {
  value: DisplayMode
  onChange: (d: DisplayMode) => void
}) {
  const modes: Array<{ value: DisplayMode; label: string; icon: React.ElementType }> = [
    { value: 'posters', label: 'Posters', icon: Grid3X3 },
    { value: 'compact-posters', label: 'Compact', icon: AlignVerticalSpaceAround },
    { value: 'text-list', label: 'Text', icon: List },
  ]

  return (
    <div className="flex gap-2">
      {modes.map((mode) => {
        const active = value === mode.value
        const Icon = mode.icon
        return (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 transition-all ${
              active
                ? 'border-primary/40 bg-primary/[0.07] shadow-sm'
                : 'border-border bg-muted hover:border-primary/30'
            }`}
          >
            <Icon className="h-4 w-4" style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)' }} />
            <span className="text-sm font-medium text-foreground">{mode.label}</span>
          </button>
        )
      })}
    </div>
  )
}
