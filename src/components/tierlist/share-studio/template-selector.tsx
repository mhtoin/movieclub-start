import { Check } from 'lucide-react'
import { TEMPLATES } from './constants'
import type { StudioSettings } from './types'

export function TemplateSelector({
  currentTemplate,
  onSelect,
}: {
  currentTemplate: string | null
  onSelect: (key: string, settings: Partial<StudioSettings>) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(TEMPLATES).map(([key, tmpl]) => {
        const active = currentTemplate === key
        return (
          <button
            key={key}
            onClick={() => onSelect(key, tmpl.settings)}
            className={`relative flex flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-all ${
              active
                ? 'border-primary/40 bg-primary/[0.07] shadow-sm'
                : 'border-border bg-muted hover:border-primary/30 hover:bg-primary/[0.05]'
            }`}
          >
            <div className="text-sm font-medium text-foreground">{tmpl.name}</div>
            <div className="text-[11px] text-muted-foreground leading-snug">{tmpl.description}</div>
            {active && (
              <div className="absolute top-1.5 right-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
