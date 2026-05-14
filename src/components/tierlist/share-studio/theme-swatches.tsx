import { Check } from 'lucide-react'
import { THEME_DEFS } from './constants'
import type { StudioTheme } from './types'

export function ThemeSwatches({
  value,
  onChange,
}: {
  value: StudioTheme
  onChange: (t: StudioTheme) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.keys(THEME_DEFS) as Array<StudioTheme>).map((theme) => {
        const def = THEME_DEFS[theme]
        const active = value === theme
        return (
          <button
            key={theme}
            onClick={() => onChange(theme)}
            className={`relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
              active
                ? 'border-primary/40 bg-primary/[0.07] shadow-sm'
                : 'border-border bg-muted hover:border-primary/30 hover:bg-primary/[0.05]'
            }`}
          >
            <div
              className="h-8 w-8 rounded-lg shrink-0 border"
              style={{ background: def.bg, borderColor: def.border }}
            />
            <div>
              <div className="text-sm font-medium text-foreground">
                {def.name}
              </div>
              <div className="flex gap-1 mt-1">
                {Object.values(def.tierColors)
                  .slice(0, 4)
                  .map((c) => (
                    <div
                      key={c}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: c }}
                    />
                  ))}
              </div>
            </div>
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
