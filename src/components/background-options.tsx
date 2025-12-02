import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { getImageUrl } from '@/lib/tmdb-api'

const nextMovieQueryOptions = dashboardQueries.nextMovie()

function useLatestMovieBackdrop() {
  const { data } = useQuery({
    ...nextMovieQueryOptions,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  })

  return useMemo(() => {
    const backdrops = data?.movie.images?.backdrops
    const posters = data?.movie.images?.posters

    const primaryBackdrop = backdrops?.find((entry) => entry?.file_path)
    const fallbackPoster = posters?.find((entry) => entry?.file_path)

    const selectedPath =
      primaryBackdrop?.file_path ?? fallbackPoster?.file_path ?? null

    if (!selectedPath) {
      return null
    }

    const preferredSize = primaryBackdrop ? 'w1280' : 'w780'
    return getImageUrl(selectedPath, preferredSize)
  }, [data])
}

export function BackdropVeilBackground() {
  const backdropUrl = useLatestMovieBackdrop()

  return (
    <div className="app-background-option" aria-hidden>
      <div className="backdrop-veil">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt=""
            loading="lazy"
            className="backdrop-veil__image"
            decoding="async"
          />
        ) : null}
        <div className="backdrop-veil__wash" />
      </div>
    </div>
  )
}

export const backgroundOptions = {
  backdropVeil: BackdropVeilBackground,
}
