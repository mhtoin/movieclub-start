import { getTierColor } from './helpers'
import type { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import type { StudioTheme } from './types'
import { Button } from '@/components/ui/button'

export function TierLabelEditor({
  tiers,
  overrides,
  customColors,
  theme,
  onOverridesChange,
  onColorsChange,
}: {
  tiers: Array<TierWithMovies>
  overrides: Record<string, string>
  customColors: Record<string, string>
  theme: StudioTheme
  onOverridesChange: (overrides: Record<string, string>) => void
  onColorsChange: (colors: Record<string, string>) => void
}) {
  const ranked = tiers
    .filter((t) => t.id !== 'unranked')
    .sort((a, b) => a.value - b.value)

  return (
    <div className="space-y-2">
      {ranked.map((tier) => {
        const val = overrides[tier.value] || tier.label
        const defaultColor = getTierColor(tier.label, theme)
        const color = customColors[tier.value] || defaultColor
        const hasCustomColor = !!customColors[tier.value]
        const hasCustomLabel = val !== tier.label

        const setLabel = (v: string) => {
          onOverridesChange({ ...overrides, [tier.value]: v })
        }
        const setColor = (c: string) => {
          onColorsChange({ ...customColors, [tier.value]: c })
        }
        const resetColor = () => {
          const next = { ...customColors }
          delete next[tier.value]
          onColorsChange(next)
        }

        return (
          <div key={tier.id} className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-7 w-7 rounded cursor-pointer border-0 p-0 overflow-hidden shrink-0"
              title="Custom color"
            />
            <input
              type="text"
              value={val}
              onChange={(e) => setLabel(e.target.value)}
              className="flex-1 min-w-0 h-8 px-2.5 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              placeholder={tier.label}
            />
            {(hasCustomLabel || hasCustomColor) && (
              <Button
                variant="ghost"
                size="xs"
                className="text-[10px] uppercase tracking-wider font-medium shrink-0"
                onClick={() => {
                  if (hasCustomLabel) {
                    const nextOverrides = { ...overrides }
                    delete nextOverrides[tier.value]
                    onOverridesChange(nextOverrides)
                  }
                  if (hasCustomColor) {
                    resetColor()
                  }
                }}
              >
                Reset
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
