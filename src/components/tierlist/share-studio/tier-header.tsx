import { TierLabel } from './tier-label'
import type { StudioSettings, ThemeDef } from './types'

export function TierHeader({
  label,
  color,
  settings,
  theme,
  count,
}: {
  label: string
  color: string
  settings: StudioSettings
  theme: ThemeDef
  count?: number
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: count !== undefined ? 10 : 12,
        marginBottom: count !== undefined ? 12 : 14,
      }}
    >
      <TierLabel
        label={label}
        color={color}
        variant={settings.tierLabelStyle}
        shape={settings.tierLabelShape}
        size="sm"
      />
      <div style={{ flex: 1, height: 2, background: theme.border, borderRadius: 1 }} />
      {count !== undefined && (
        <span style={{ fontSize: 13, color: theme.muted }}>{count}</span>
      )}
    </div>
  )
}
