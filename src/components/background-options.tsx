import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

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

export function ProjectorBackground() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return <div className="app-background-option" aria-hidden />

  const dustMotes = [
    { cx: 960, cy: 85, r: 1.2, i: 1 },
    { cx: 982, cy: 108, r: 1.0, i: 2 },
    { cx: 970, cy: 200, r: 2.0, i: 1 },
    { cx: 995, cy: 220, r: 1.7, i: 3 },
    { cx: 900, cy: 280, r: 2.5, i: 1 },
    { cx: 1060, cy: 265, r: 2.1, i: 3 },
    { cx: 1030, cy: 410, r: 2.0, i: 1 },
    { cx: 955, cy: 475, r: 2.9, i: 3 },
    { cx: 985, cy: 545, r: 2.2, i: 3 },
    { cx: 1050, cy: 560, r: 1.9, i: 1 },
    { cx: 955, cy: 860, r: 2.8, i: 3 },
    { cx: 930, cy: 800, r: 1.3, i: 1 },
  ]

  return (
    <div className="app-background-option" aria-hidden>
      <div className="bg-projector">
        <svg
          className="bg-projector__svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient
              id="projBeam"
              cx="50%"
              cy="0%"
              r="100%"
              fx="50%"
              fy="0%"
            >
              <stop offset="0%" className="bg-projector__beam-center" />
              <stop offset="55%" className="bg-projector__beam-mid" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <filter
              id="projBeamBlur"
              x="-40%"
              y="-10%"
              width="180%"
              height="130%"
            >
              <feGaussianBlur stdDeviation="40" />
            </filter>
            <filter
              id="projDustBlur"
              x="-200%"
              y="-200%"
              width="500%"
              height="500%"
            >
              <feGaussianBlur stdDeviation="1" />
            </filter>
          </defs>
          <ellipse
            cx="960"
            cy="0"
            rx="380"
            ry="980"
            fill="url(#projBeam)"
            filter="url(#projBeamBlur)"
            className="bg-projector__beam"
          />
          <ellipse
            cx="960"
            cy="0"
            rx="160"
            ry="80"
            fill="url(#projBeam)"
            filter="url(#projBeamBlur)"
            className="bg-projector__halo"
          />
          {dustMotes.map((d) => (
            <circle
              key={`${d.cx}-${d.cy}`}
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              filter="url(#projDustBlur)"
              className={`bg-projector__dust bg-projector__dust--${d.i}`}
            />
          ))}
          <g className="bg-projector__device">
            <rect
              x={848}
              y={-72}
              width={224}
              height={88}
              rx={14}
              fill="none"
              strokeWidth={2.5}
            />
            <rect
              x={858}
              y={-58}
              width={60}
              height={60}
              rx={4}
              fill="none"
              strokeWidth={1.5}
            />
            <circle cx={858} cy={-28} r={24} fill="none" strokeWidth={2} />
            <circle cx={858} cy={-28} r={14} fill="none" strokeWidth={1.5} />
            <circle cx={858} cy={-28} r={6} fill="none" strokeWidth={1.5} />
            <line
              x1={930}
              y1={-50}
              x2={1060}
              y2={-50}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <line
              x1={930}
              y1={-28}
              x2={1060}
              y2={-28}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <line
              x1={930}
              y1={-6}
              x2={1020}
              y2={-6}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    </div>
  )
}

export function DustBackground() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return <div className="app-background-option" aria-hidden />

  const motes = [
    { cx: 112, cy: 68, r: 1.8, i: 1 },
    { cx: 580, cy: 92, r: 2.0, i: 3 },
    { cx: 960, cy: 72, r: 1.6, i: 2 },
    { cx: 1420, cy: 88, r: 2.2, i: 4 },
    { cx: 1840, cy: 100, r: 1.3, i: 5 },
    { cx: 230, cy: 185, r: 1.3, i: 6 },
    { cx: 690, cy: 200, r: 2.8, i: 3 },
    { cx: 1060, cy: 180, r: 1.9, i: 5 },
    { cx: 1500, cy: 195, r: 2.0, i: 8 },
    { cx: 390, cy: 370, r: 1.5, i: 7 },
    { cx: 800, cy: 390, r: 2.1, i: 5 },
    { cx: 1210, cy: 380, r: 1.3, i: 2 },
    { cx: 1650, cy: 400, r: 1.4, i: 3 },
    { cx: 300, cy: 580, r: 2.3, i: 1 },
    { cx: 950, cy: 625, r: 2.7, i: 2 },
    { cx: 1590, cy: 610, r: 2.2, i: 7 },
    { cx: 660, cy: 840, r: 2.4, i: 8 },
    { cx: 1330, cy: 820, r: 2.0, i: 3 },
  ]

  return (
    <div className="app-background-option" aria-hidden>
      <div className="bg-dust">
        <svg
          className="bg-dust__svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter
              id="dustMoteBlur"
              x="-300%"
              y="-300%"
              width="700%"
              height="700%"
            >
              <feGaussianBlur stdDeviation="0.8" />
            </filter>
          </defs>
          {motes.map((d) => (
            <circle
              key={`${d.cx}-${d.cy}`}
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              filter="url(#dustMoteBlur)"
              className={`bg-dust__mote bg-dust__mote--${d.i}`}
            />
          ))}
        </svg>
      </div>
    </div>
  )
}

export type BackgroundOptionKey =
  | 'none'
  | 'minimal'
  | 'backdropVeil'
  | 'projector'
  | 'dust'

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
  backdropVeil: {
    label: 'Movie Backdrop',
    description: 'Current movie poster backdrop',
    component: BackdropVeilBackground,
  },
  projector: {
    label: 'Projector',
    description: 'Cinema projector beam',
    component: ProjectorBackground,
  },
  dust: {
    label: 'Dust',
    description: 'Floating dust particles',
    component: DustBackground,
  },
}

export const backgroundOptions = {
  backdropVeil: BackdropVeilBackground,
}
