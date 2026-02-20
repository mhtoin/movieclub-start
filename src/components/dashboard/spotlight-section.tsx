import { EmptyState } from '@/components/dashboard/empty-state'
import { MovieSpotlight } from '@/components/dashboard/movie-spotlight'
import { dashboardQueries } from '@/lib/react-query/queries/dashboard'
import { useSuspenseQuery } from '@tanstack/react-query'

export function SpotlightSection() {
  const { data: nextMovie } = useSuspenseQuery(dashboardQueries.nextMovie())
  return nextMovie ? <MovieSpotlight movieData={nextMovie} /> : <EmptyState />
}
