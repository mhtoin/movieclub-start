import { MovieReel } from '@/components/home/movie-reel'
import { homeQueries, type TMDBMovie } from '@/lib/react-query/queries/home'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ThumbsUp } from 'lucide-react'

export function RecommendationsSection({ userId }: { userId: string }) {
  const { data: recommendations } = useSuspenseQuery(
    homeQueries.recommendations(userId),
  )

  if (!recommendations?.length) return null

  return (
    <MovieReel
      title="Recommended"
      subtitle="Based on your highly ranked films"
      icon={<ThumbsUp className="h-5 w-5" />}
      movies={recommendations as TMDBMovie[]}
      accentColor="blue"
    />
  )
}
