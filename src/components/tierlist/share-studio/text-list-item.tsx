import { formatRuntime, formatYear } from './helpers'
import type { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import type { StudioSettings, ThemeDef } from './types'

export function TextListItem({
  movie,
  settings,
  theme,
}: {
  movie: TierWithMovies['movies'][number]
  settings: StudioSettings
  theme: ThemeDef
}) {
  const year = formatYear(movie.releaseDate)
  const runtime = formatRuntime(movie.runtime)
  const rating = movie.voteAverage.toFixed(1)
  const genres = movie.genres?.slice(0, 2).join(', ')

  const metaItems: Array<string> = []
  if (settings.showMovieYear && year) metaItems.push(year)
  if (settings.showMovieRuntime && runtime) metaItems.push(runtime)
  if (settings.showMovieRating && rating && Number(rating) > 0)
    metaItems.push(`★ ${rating}`)
  if (settings.showMovieGenres && genres) metaItems.push(genres)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        paddingBottom: 6,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: theme.fg,
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
        }}
      >
        {movie.title}
      </span>
      {metaItems.length > 0 && (
        <span
          style={{
            fontSize: 12,
            color: theme.muted,
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.02em',
          }}
        >
          {metaItems.join('  ·  ')}
        </span>
      )}
    </div>
  )
}
