import {
  discoverMovies,
  DiscoverParams,
  fetchBackgroundMovies,
  fetchMovieDetails,
  fetchWatchProviders,
  getFilters,
  searchMovies,
} from '@/lib/tmdb-api'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'

export const tmdbQueries = {
  backgroundMovies: (count: number = 12) =>
    queryOptions({
      queryKey: ['tmdb', 'backgroundMovies', count],
      queryFn: () => fetchBackgroundMovies(count),
      staleTime: 1000 * 60 * 60 * 24,
    }),
  genres: () =>
    queryOptions({
      queryKey: ['tmdb', 'genres'],
      queryFn: getFilters,
      staleTime: 1000 * 60 * 60 * 24,
    }),
  watchProviders: () =>
    queryOptions({
      queryKey: ['tmdb', 'watchProviders'],
      queryFn: fetchWatchProviders,
      staleTime: 1000 * 60 * 60 * 24,
    }),
  movieDetails: (movieId: number) =>
    queryOptions({
      queryKey: ['tmdb', 'movie', movieId],
      queryFn: () => fetchMovieDetails(movieId),
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60,
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
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 30,
    }),
  search: (query: string) =>
    infiniteQueryOptions({
      queryKey: ['tmdb', 'search', query],
      queryFn: ({ pageParam }) => searchMovies({ query, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.total_pages) {
          return lastPage.page + 1
        }
        return undefined
      },
      staleTime: 1000 * 60 * 15,
      gcTime: 1000 * 60 * 30,
    }),
}
