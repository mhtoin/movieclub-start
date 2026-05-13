import { ASPECT_RATIOS } from './constants'
import type { AspectRatio } from './types'

export function AspectRatioPicker({
  value,
  onChange,
}: {
  value: AspectRatio
  onChange: (a: AspectRatio) => void
}) {
  return (
    <div className="flex gap-2">
      {(
        Object.entries(ASPECT_RATIOS) as Array<
          [AspectRatio, (typeof ASPECT_RATIOS)['1:1']]
        >
      ).map(([key, { label }]) => {
        const active = value === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2 transition-all ${
              active
                ? 'border-primary/40 bg-primary/[0.07]'
                : 'border-border bg-muted hover:border-primary/30'
            }`}
          >
            <div
              className="rounded border-2"
              style={{
                width: key === '16:9' ? 28 : key === '9:16' ? 14 : 20,
                height: key === '16:9' ? 16 : key === '9:16' ? 24 : 20,
                borderColor: active
                  ? 'var(--primary)'
                  : 'var(--muted-foreground)',
                opacity: active ? 1 : 0.5,
              }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
