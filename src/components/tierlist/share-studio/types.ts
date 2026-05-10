import type { TierWithMovies } from '@/lib/react-query/queries/tierlists'

export type StudioTheme =
  | 'dark-theater'
  | 'warm-lobby'
  | 'vintage-paper'
  | 'neon-noir'
  | 'minimal-white'

export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9'
export type DisplayMode = 'posters' | 'text-list' | 'compact-posters'
export type TextColumns = 1 | 2 | 3 | 4 | 5
export type BackgroundType = 'theme' | 'solid' | 'image'

export interface StudioSettings {
  theme: StudioTheme
  aspectRatio: AspectRatio
  displayMode: DisplayMode
  backgroundType: BackgroundType
  backgroundSolid: string
  backgroundImage: string | null
  accentColor: string | null
  tierOrder: Array<string> | null
  showTitle: boolean
  showAuthor: boolean
  showDateRange: boolean
  showMovieCount: boolean
  showTierLabels: boolean
  posterSize: 'sm' | 'md' | 'lg'
  tierLabelShape: 'rounded' | 'square' | 'circle' | 'pill'
  tierLabelStyle: 'badge' | 'letter'
  tierLabelOverrides: Record<string, string>
  tierLabelCustomColors: Record<string, string>
  textListColumns: TextColumns
  showMovieYear: boolean
  showMovieRuntime: boolean
  showMovieRating: boolean
  showMovieGenres: boolean
  compactPosterSize: 'xs' | 'sm' | 'md'
  hideEmptyTiers: boolean
}

export interface SharePreset {
  name: string
  settings: Partial<StudioSettings>
  createdAt: number
}

export interface TemplateDef {
  name: string
  description: string
  settings: Partial<StudioSettings>
}

export interface ThemeDef {
  name: string
  bg: string
  fg: string
  accent: string
  muted: string
  border: string
  tierColors: Record<string, string>
  font: string
}

export interface ShareStudioTierlist {
  title: string | null
  watchDateFrom: string | null
  watchDateTo: string | null
  tiers: Array<TierWithMovies>
}
