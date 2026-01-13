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

export function ShapesBackground() {
  return (
    <div className="app-background-option" aria-hidden>
      <div className="bg-geometric">
        <svg
          className="bg-geometric__svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="perfPattern"
              x="0"
              y="0"
              width="40"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <rect
                x="12"
                y="5"
                width="16"
                height="12"
                rx="2"
                className="bg-geometric__perf"
              />
            </pattern>
          </defs>

          <rect
            x="0"
            y="0"
            width="40"
            height="100%"
            fill="url(#perfPattern)"
            className="bg-geometric__strip"
          />
          <rect
            x="1880"
            y="0"
            width="40"
            height="100%"
            fill="url(#perfPattern)"
            className="bg-geometric__strip"
          />

          <circle
            cx="15%"
            cy="20%"
            r="80"
            className="bg-geometric__shape bg-geometric__shape--1"
          />
          <circle
            cx="85%"
            cy="75%"
            r="120"
            className="bg-geometric__shape bg-geometric__shape--2"
          />
          <rect
            x="70%"
            y="15%"
            width="100"
            height="100"
            rx="8"
            className="bg-geometric__shape bg-geometric__shape--3"
            transform="rotate(15, 1344, 162)"
          />
          <rect
            x="20%"
            y="70%"
            width="80"
            height="80"
            rx="6"
            className="bg-geometric__shape bg-geometric__shape--4"
            transform="rotate(-10, 384, 756)"
          />

          <circle
            cx="8%"
            cy="55%"
            r="50"
            className="bg-geometric__shape bg-geometric__shape--5"
          />
          <circle
            cx="92%"
            cy="30%"
            r="65"
            className="bg-geometric__shape bg-geometric__shape--6"
          />
          <rect
            x="45%"
            y="85%"
            width="70"
            height="70"
            rx="4"
            className="bg-geometric__shape bg-geometric__shape--7"
            transform="rotate(25, 864, 918)"
          />
          <rect
            x="55%"
            y="8%"
            width="60"
            height="60"
            rx="30"
            className="bg-geometric__shape bg-geometric__shape--8"
          />

          <polygon
            points="150,650 200,750 100,750"
            className="bg-geometric__shape bg-geometric__shape--9"
          />
          <polygon
            points="1750,350 1800,450 1700,450"
            className="bg-geometric__shape bg-geometric__shape--10"
          />

          <line
            x1="5%"
            y1="40%"
            x2="25%"
            y2="35%"
            className="bg-geometric__line bg-geometric__line--1"
          />
          <line
            x1="75%"
            y1="55%"
            x2="95%"
            y2="60%"
            className="bg-geometric__line bg-geometric__line--2"
          />

          <circle
            cx="50%"
            cy="50%"
            r="200"
            className="bg-geometric__reel"
            strokeDasharray="20 10"
          />
          <circle cx="50%" cy="50%" r="60" className="bg-geometric__reel-hub" />
        </svg>
      </div>
    </div>
  )
}

export function AuroraBackground() {
  return (
    <div className="app-background-option" aria-hidden>
      <div className="bg-aurora">
        <svg
          className="bg-aurora__svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter
              id="auroraBlur"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
            </filter>
            <linearGradient
              id="auroraGrad1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                className="bg-aurora__stop bg-aurora__stop--1a"
              />
              <stop
                offset="100%"
                className="bg-aurora__stop bg-aurora__stop--1b"
              />
            </linearGradient>
            <linearGradient
              id="auroraGrad2"
              x1="100%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                className="bg-aurora__stop bg-aurora__stop--2a"
              />
              <stop
                offset="100%"
                className="bg-aurora__stop bg-aurora__stop--2b"
              />
            </linearGradient>
            <linearGradient
              id="auroraGrad3"
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
            >
              <stop
                offset="0%"
                className="bg-aurora__stop bg-aurora__stop--3a"
              />
              <stop
                offset="100%"
                className="bg-aurora__stop bg-aurora__stop--3b"
              />
            </linearGradient>
          </defs>
          <ellipse
            cx="30%"
            cy="25%"
            rx="900"
            ry="400"
            fill="url(#auroraGrad1)"
            filter="url(#auroraBlur)"
            className="bg-aurora__wave bg-aurora__wave--1"
          />
          <ellipse
            cx="70%"
            cy="45%"
            rx="1000"
            ry="350"
            fill="url(#auroraGrad2)"
            filter="url(#auroraBlur)"
            className="bg-aurora__wave bg-aurora__wave--2"
          />
          <ellipse
            cx="50%"
            cy="70%"
            rx="800"
            ry="300"
            fill="url(#auroraGrad3)"
            filter="url(#auroraBlur)"
            className="bg-aurora__wave bg-aurora__wave--3"
          />
        </svg>
      </div>
    </div>
  )
}

export function MinimalBackground() {
  return (
    <div className="app-background-option" aria-hidden>
      <div className="bg-minimal" />
    </div>
  )
}

export function NoneBackground() {
  return (
    <div className="app-background-option app-background-none" aria-hidden />
  )
}

export type BackgroundOptionKey =
  | 'none'
  | 'minimal'
  | 'shapes'
  | 'aurora'
  | 'backdropVeil'

export const BACKGROUND_OPTIONS: Record<
  BackgroundOptionKey,
  {
    label: string
    description: string
    component: React.ComponentType
  }
> = {
  none: {
    label: 'None',
    description: 'Solid background color only',
    component: NoneBackground,
  },
  minimal: {
    label: 'Minimal',
    description: 'Subtle gradient',
    component: MinimalBackground,
  },
  shapes: {
    label: 'Shapes',
    description: 'Floating shapes',
    component: ShapesBackground,
  },
  aurora: {
    label: 'Aurora',
    description: 'Flowing northern lights waves',
    component: AuroraBackground,
  },
  backdropVeil: {
    label: 'Movie Backdrop',
    description: 'Current movie poster backdrop',
    component: BackdropVeilBackground,
  },
}

export const backgroundOptions = {
  backdropVeil: BackdropVeilBackground,
}
