import { MovieReel } from '@/components/home/movie-reel'
import { homeQueries, type TMDBMovie } from '@/lib/react-query/queries/home'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Flame } from 'lucide-react'

export function TrendingSection() {
  const { data: trendingMovies } = useSuspenseQuery(homeQueries.trending())

  if (!trendingMovies?.length) return null

  return (
    <MovieReel
      title="Trending Now"
      subtitle="Popular on your streaming services"
      icon={<Flame className="h-5 w-5" />}
      movies={trendingMovies as TMDBMovie[]}
      accentColor="orange"
    />
  )
}
