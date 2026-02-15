import { getImageUrl } from '@/lib/tmdb-api'
import { Star } from 'lucide-react'
import { DashboardList, type DashboardListItemRenderer } from './dashboard-list'

interface TopMovie {
  title: string
  rating: number
  posterPath: string | null
  year: string
}

interface LongestMovie {
  title: string
  runtime: number
  posterPath: string | null
}

export function HighestRatedList({ data }: { data: TopMovie[] }) {
  const renderer: DashboardListItemRenderer<TopMovie> = {
    getKey: (movie) => movie.title,

    renderImage: (movie) =>
      movie.posterPath ? (
        <img
          src={getImageUrl(movie.posterPath, 'w92') || ''}
          alt={movie.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-[8px] text-muted-foreground">
          🎬
        </div>
      ),

    renderContent: (movie) => (
      <>
        <p className="text-sm font-medium truncate">{movie.title}</p>
        <p className="text-xs text-muted-foreground">{movie.year}</p>
      </>
    ),

    renderRight: (movie) => (
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-semibold tabular-nums">
          {movie.rating.toFixed(1)}
        </span>
      </div>
    ),
  }

  return (
    <DashboardList
      data={data}
      config={{
        showRank: true,
        rankStyle: 'hash',
        imageShape: 'rectangle',
        imageSize: 'h-12 w-8',
        showProgress: false,
        itemSpacing: 'space-y-3',
        emptyMessage: 'No movies rated yet',
      }}
      renderer={renderer}
    />
  )
}

export function LongestMoviesList({ data }: { data: LongestMovie[] }) {
  const maxRuntime = data[0]?.runtime || 1

  const renderer: DashboardListItemRenderer<LongestMovie> = {
    getKey: (movie) => movie.title,

    renderImage: (movie) =>
      movie.posterPath ? (
        <img
          src={getImageUrl(movie.posterPath, 'w92') || ''}
          alt={movie.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-[8px] text-muted-foreground">
          🎬
        </div>
      ),

    renderContent: (movie) => (
      <p className="text-sm font-medium truncate">{movie.title}</p>
    ),

    renderRight: (movie) => {
      const hours = Math.floor(movie.runtime / 60)
      const mins = movie.runtime % 60
      return (
        <span className="text-xs text-muted-foreground tabular-nums">
          {hours}h {mins}m
        </span>
      )
    },

    getProgress: (movie) => (movie.runtime / maxRuntime) * 100,
  }

  return (
    <DashboardList
      data={data}
      config={{
        showRank: true,
        rankStyle: 'hash',
        imageShape: 'rectangle',
        imageSize: 'h-12 w-8',
        showProgress: true,
        progressColor: 'bg-primary/60',
        itemSpacing: 'space-y-3',
        emptyMessage: 'No runtime data yet',
      }}
      renderer={renderer}
    />
  )
}
