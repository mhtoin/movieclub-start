import type { FilterScope } from '@/components/dashboard/scope-toggle'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { getImageUrl } from '@/lib/tmdb-api'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Star, Trophy } from 'lucide-react'

interface OverviewCardsProps {
  userId: string
  scope: FilterScope
}

export function OverviewCards({ userId, scope }: OverviewCardsProps) {
  const isMine = scope === 'mine'
  const { data: insights } = useSuspenseQuery(
    dashboardQueries.insights(isMine ? userId : undefined),
  )

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const topMovie = insights.highestRated?.[0]
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const topGenre = insights.genreDistribution?.[0]
  const totalMovies = insights.ratingDistribution.reduce(
    (sum, r) => sum + r.count,
    0,
  )
  const highRatings = insights.ratingDistribution
    .filter((r) => parseInt(r.range) >= 7)
    .reduce((sum, r) => sum + r.count, 0)
  const ratingPercent =
    totalMovies > 0 ? Math.round((highRatings / totalMovies) * 100) : 0

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!topMovie && !topGenre) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {topMovie ? (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Top Rated
            </p>
            <p className="font-semibold truncate mt-0.5">{topMovie.title}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {topMovie.rating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                · {topMovie.year}
              </span>
            </div>
          </div>
          {topMovie.posterPath ? (
            <div className="w-10 h-14 rounded-md overflow-hidden flex-shrink-0 border border-border">
              <img
                src={getImageUrl(topMovie.posterPath, 'w92') ?? ''}
                alt={topMovie.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
        </div>
      ) : null}
      {topGenre ? (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Favorite Genre
            </p>
            <p className="font-semibold mt-0.5">{topGenre.genre}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {topGenre.count} movie{topGenre.count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ) : null}

      {totalMovies > 0 ? (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Quality Score
            </p>
            <p className="font-semibold mt-0.5">{ratingPercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              movies rated 7+
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
