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

function FilmReel({
  x,
  y,
  size = 100,
  className,
}: {
  x: number
  y: number
  size?: number
  className: string
}) {
  const centerX = x + size / 2
  const centerY = y + size / 2
  const holeRadius = size * 0.09
  const holeDistance = size * 0.22
  const holeCount = 6

  return (
    <g className={className}>
      <circle
        cx={centerX}
        cy={centerY}
        r={size * 0.46}
        fill="none"
        strokeWidth={size * 0.08}
      />
      <circle
        cx={centerX}
        cy={centerY}
        r={size * 0.3}
        fill="none"
        strokeWidth={size * 0.04}
      />
      {Array.from({ length: holeCount }, (_, i) => {
        const angle = (i * 360) / holeCount
        const holeX = centerX + holeDistance * Math.cos((angle * Math.PI) / 180)
        const holeY = centerY + holeDistance * Math.sin((angle * Math.PI) / 180)
        return (
          <circle
            key={i}
            cx={holeX}
            cy={holeY}
            r={holeRadius}
            className="bg-cinema__hole"
          />
        )
      })}
      <circle
        cx={centerX}
        cy={centerY}
        r={size * 0.12}
        fill="none"
        strokeWidth={size * 0.03}
      />
    </g>
  )
}

function ClapperBoard({
  x,
  y,
  size = 100,
  rotation = 0,
  className,
  clapOpen = false,
}: {
  x: number
  y: number
  size?: number
  rotation?: number
  className: string
  clapOpen?: boolean
}) {
  const width = size
  const height = size * 0.7
  const clapHeight = height * 0.25
  const stripeWidth = width / 7

  return (
    <g className={className}>
      <g
        transform={`translate(${x}, ${y}) rotate(${rotation} ${width / 2} ${height / 2})`}
      >
        <rect
          x={0}
          y={clapHeight * 0.8}
          width={width}
          height={height - clapHeight * 0.5}
          rx={size * 0.03}
          fill="none"
          strokeWidth={size * 0.025}
        />
        <g transform={`rotate(${clapOpen ? -25 : 0} 0 ${clapHeight})`}>
          <rect
            x={0}
            y={0}
            width={width}
            height={clapHeight}
            rx={size * 0.02}
            fill="none"
            strokeWidth={size * 0.025}
          />
          {Array.from({ length: 4 }, (_, i) => (
            <line
              key={i}
              x1={stripeWidth * (i * 2 + 1)}
              y1={0}
              x2={stripeWidth * (i * 2 + 1.5)}
              y2={clapHeight}
              strokeWidth={stripeWidth * 0.8}
              strokeLinecap="butt"
            />
          ))}
        </g>
        <line
          x1={width * 0.1}
          y1={height * 0.5}
          x2={width * 0.7}
          y2={height * 0.5}
          strokeWidth={size * 0.02}
          strokeLinecap="round"
        />
        <line
          x1={width * 0.1}
          y1={height * 0.65}
          x2={width * 0.5}
          y2={height * 0.65}
          strokeWidth={size * 0.02}
          strokeLinecap="round"
        />
        <line
          x1={width * 0.1}
          y1={height * 0.8}
          x2={width * 0.6}
          y2={height * 0.8}
          strokeWidth={size * 0.02}
          strokeLinecap="round"
        />
      </g>
    </g>
  )
}

export function ShapesBackground() {
  return (
    <div className="app-background-option" aria-hidden>
      <div className="bg-cinema">
        <svg
          className="bg-cinema__svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          <FilmReel
            x={96}
            y={108}
            size={140}
            className="bg-cinema__item bg-cinema__item--1"
          />
          <FilmReel
            x={1632}
            y={702}
            size={180}
            className="bg-cinema__item bg-cinema__item--2"
          />
          <FilmReel
            x={1440}
            y={54}
            size={100}
            className="bg-cinema__item bg-cinema__item--3"
          />
          <FilmReel
            x={38}
            y={756}
            size={120}
            className="bg-cinema__item bg-cinema__item--4"
          />
          <FilmReel
            x={864}
            y={810}
            size={90}
            className="bg-cinema__item bg-cinema__item--5"
          />

          <ClapperBoard
            x={480}
            y={54}
            size={120}
            rotation={-12}
            className="bg-cinema__item bg-cinema__item--6"
          />
          <ClapperBoard
            x={1152}
            y={594}
            size={100}
            rotation={8}
            className="bg-cinema__item bg-cinema__item--7"
            clapOpen
          />
          <ClapperBoard
            x={288}
            y={486}
            size={80}
            rotation={-5}
            className="bg-cinema__item bg-cinema__item--8"
          />
          <ClapperBoard
            x={1536}
            y={324}
            size={90}
            rotation={15}
            className="bg-cinema__item bg-cinema__item--9"
            clapOpen
          />
          <ClapperBoard
            x={768}
            y={270}
            size={70}
            rotation={-8}
            className="bg-cinema__item bg-cinema__item--10"
          />
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
