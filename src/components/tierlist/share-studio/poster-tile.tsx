import { Film } from 'lucide-react'
import { getPosterPath } from './helpers'
import type { TierWithMovies } from '@/lib/react-query/queries/tierlists'
import type { ThemeDef } from './types'
import { getImageUrl } from '@/lib/tmdb-api'

export function PosterTile({
  movie,
  width,
  theme,
}: {
  movie: TierWithMovies['movies'][number]
  width: number
  theme: ThemeDef
}) {
  const posterPath = getPosterPath(movie)
  const url = posterPath ? getImageUrl(posterPath, 'w342') : null

  return (
    <div
      style={{
        width,
        height: width * 1.5,
        borderRadius: 6,
        overflow: 'hidden',
        background: theme.border,
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {url ? (
        <img
          src={url}
          alt={movie.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          crossOrigin="anonymous"
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.muted,
          }}
        >
          <Film size={20} />
        </div>
      )}
    </div>
  )
}
