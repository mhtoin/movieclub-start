import { THEME_DEFS } from './constants'
import type { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import type { StudioSettings, StudioTheme } from './types'

export function getPosterPath(movie: TierWithMovies['movies'][number]): string | null {
  const images = movie.images as Record<string, unknown> | null
  if (!images) return null
  const posters = images.posters as Array<{ file_path?: string }> | undefined
  if (!posters || posters.length === 0) return null
  return posters[0].file_path || null
}

export function getTierColor(
  label: string,
  theme: StudioTheme,
  customColors?: Record<string, string>,
  value?: number,
): string {
  if (value !== undefined && customColors?.[value]) return customColors[value]
  const defs = THEME_DEFS[theme].tierColors
  return defs[label] || defs['F'] || '#888'
}

export function formatYear(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime()) ? null : String(d.getFullYear())
}

export function formatRuntime(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

export function sortTiers(tiers: Array<TierWithMovies>, order: Array<string> | null): Array<TierWithMovies> {
  if (!order || order.length === 0) return tiers
  const map = new Map(tiers.map((t) => [t.id, t]))
  const sorted = order.map((id) => map.get(id)).filter(Boolean) as Array<TierWithMovies>
  const seen = new Set(order)
  tiers.forEach((t) => {
    if (!seen.has(t.id)) sorted.push(t)
  })
  return sorted
}

export function getTierLabelShape(shape: StudioSettings['tierLabelShape']): React.CSSProperties['borderRadius'] {
  switch (shape) {
    case 'square': return 4
    case 'circle': return '50%'
    case 'pill': return 9999
    default: return 12
  }
}

export function estimateLabelWidth(
  label: string,
  size: 'sm' | 'md' | 'lg',
  shape: StudioSettings['tierLabelShape'],
) {
  const fontSize =
    label.length <= 2
      ? size === 'sm' ? 18 : size === 'lg' ? 26 : 22
      : label.length <= 5
        ? size === 'sm' ? 14 : size === 'lg' ? 20 : 16
        : label.length <= 10
          ? size === 'sm' ? 12 : size === 'lg' ? 16 : 14
          : label.length <= 16
            ? size === 'sm' ? 10 : size === 'lg' ? 14 : 12
            : size === 'sm' ? 9 : size === 'lg' ? 12 : 10

  const charWidth = fontSize * 0.55
  const textWidth = label.length * charWidth
  const padding = shape === 'circle' ? 20 : 28
  return Math.ceil(textWidth + padding)
}
