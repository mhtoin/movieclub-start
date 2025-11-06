import {
  discoverMovies,
  DiscoverParams,
  fetchMovieDetails,
  fetchWatchProviders,
  getFilters,
} from '@/lib/tmdb-api'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'

export const tmdbQueries = {
  genres: () => ({
    queryKey: ['tmdb', 'genres'],
    queryFn: getFilters,
  }),
  watchProviders: () => ({
    queryKey: ['tmdb', 'watchProviders'],
    queryFn: fetchWatchProviders,
  }),
  movieDetails: (movieId: number) =>
    queryOptions({
      queryKey: ['tmdb', 'movie', movieId],
      queryFn: () => fetchMovieDetails(movieId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),
  discover: (filters: Omit<DiscoverParams, 'page'>) =>
    infiniteQueryOptions({
      queryKey: ['tmdb', 'discover', filters],
      queryFn: ({ pageParam }) =>
        discoverMovies({ ...filters, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.total_pages) {
          return lastPage.page + 1
        }
        return undefined
      },
    }),
}
