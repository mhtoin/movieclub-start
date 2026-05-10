import { THEME_DEFS } from './constants'
import { getTierColor } from './helpers'
import { PosterTile } from './poster-tile'
import { TierHeader } from './tier-header'
import type { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import type { StudioSettings } from './types'

export function CompactPosterModeBody({
  rankedTiers,
  settings,
  getLabel,
}: {
  rankedTiers: Array<TierWithMovies>
  settings: StudioSettings
  getLabel: (t: TierWithMovies) => string
}) {
  const theme = THEME_DEFS[settings.theme]
  const width =
    settings.compactPosterSize === 'xs'
      ? 55
      : settings.compactPosterSize === 'md'
        ? 85
        : 70
  const gap = 8

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {rankedTiers.map((tier) => {
        const label = getLabel(tier)
        const tierColor = getTierColor(
          tier.label,
          settings.theme,
          settings.tierLabelCustomColors,
          tier.value,
        )
        return (
          <div key={tier.id}>
            {settings.showTierLabels && (
              <TierHeader
                label={label}
                color={tierColor}
                settings={settings}
                theme={theme}
                count={tier.movies.length}
              />
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap }}>
              {tier.movies.map((m) => (
                <PosterTile key={m.id} movie={m} width={width} theme={theme} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
