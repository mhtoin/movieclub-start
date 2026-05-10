import { THEME_DEFS } from './constants'
import { getTierColor } from './helpers'
import { TextListItem } from './text-list-item'
import { TierHeader } from './tier-header'
import type { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import type { StudioSettings } from './types'

export function TextListModeBody({
  rankedTiers,
  settings,
  getLabel,
}: {
  rankedTiers: Array<TierWithMovies>
  settings: StudioSettings
  getLabel: (t: TierWithMovies) => string
}) {
  const theme = THEME_DEFS[settings.theme]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {rankedTiers.map((tier) => {
        const label = getLabel(tier)
        const tierColor = getTierColor(tier.label, settings.theme, settings.tierLabelCustomColors, tier.value)
        const colCount = settings.textListColumns
        const colGap = colCount > 3 ? 16 : 24

        return (
          <div key={tier.id}>
            {settings.showTierLabels && (
              <TierHeader
                label={label}
                color={tierColor}
                settings={settings}
                theme={theme}
              />
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                gap: `${8}px ${colGap}px`,
              }}
            >
              {tier.movies.map((m) => (
                <TextListItem key={m.id} movie={m} settings={settings} theme={theme} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
