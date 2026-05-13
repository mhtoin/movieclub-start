import { useMemo } from 'react'
import { THEME_DEFS } from './constants'
import { estimateLabelWidth, getTierColor } from './helpers'
import { PosterTile } from './poster-tile'
import { TierLabel } from './tier-label'
import type { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import type { StudioSettings } from './types'

export function PosterModeBody({
  rankedTiers,
  settings,
  getLabel,
}: {
  rankedTiers: Array<TierWithMovies>
  settings: StudioSettings
  getLabel: (t: TierWithMovies) => string
}) {
  const theme = THEME_DEFS[settings.theme]
  const posterDimensions = useMemo(() => {
    switch (settings.posterSize) {
      case 'sm':
        return { width: 70, gap: 8 }
      case 'lg':
        return { width: 110, gap: 12 }
      default:
        return { width: 90, gap: 10 }
    }
  }, [settings.posterSize])

  const labelSize =
    settings.posterSize === 'lg'
      ? 'lg'
      : settings.posterSize === 'sm'
        ? 'sm'
        : 'md'

  const labelColumnWidth = useMemo(() => {
    if (!settings.showTierLabels) return 0
    const baseDim = labelSize === 'sm' ? 44 : labelSize === 'lg' ? 72 : 56
    let max = baseDim
    for (const tier of rankedTiers) {
      const label = getLabel(tier)
      const estimated = estimateLabelWidth(
        label,
        labelSize,
        settings.tierLabelShape,
      )
      max = Math.max(max, estimated)
    }
    return Math.min(max, 180)
  }, [
    rankedTiers,
    settings.showTierLabels,
    settings.tierLabelShape,
    labelSize,
    getLabel,
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {rankedTiers.map((tier) => {
        const label = getLabel(tier)
        const tierColor = getTierColor(
          tier.label,
          settings.theme,
          settings.tierLabelCustomColors,
          tier.value,
        )
        return (
          <div
            key={tier.id}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}
          >
            {settings.showTierLabels && (
              <div
                style={{
                  width: labelColumnWidth,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <TierLabel
                  label={label}
                  color={tierColor}
                  variant={settings.tierLabelStyle}
                  shape={settings.tierLabelShape}
                  size={labelSize}
                />
              </div>
            )}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: posterDimensions.gap,
                flex: 1,
                alignContent: 'flex-start',
              }}
            >
              {tier.movies.map((m) => (
                <PosterTile
                  key={m.id}
                  movie={m}
                  width={posterDimensions.width}
                  theme={theme}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
