import { TMDBMovieResponse } from '@/types/tmdb'

// Types for The Movie Database API
export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  original_language: string
  original_title: string
  popularity: number
  video: boolean
}

export interface TMDBResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export type TimeWindow = 'day' | 'week'

const TMDB_CONFIG = {
  API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  BASE_URL:
    import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL:
    import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
}

export function getImageUrl(
  path: string | null,
  size: string = 'w500',
): string | null {
  if (!path) return null
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`
}

export async function fetchTrendingMovies(
  timeWindow: TimeWindow = 'week',
): Promise<Movie[]> {
  if (!TMDB_CONFIG.API_KEY) {
    throw new Error('TMDB API key is not configured')
  }

  const url = `${TMDB_CONFIG.BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_CONFIG.API_KEY}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      )
    }

    const data: TMDBResponse = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching trending movies:', error)
    throw error
  }
}

export async function fetchBackgroundMovies(
  count: number = 12,
  timeWindow: TimeWindow = 'week',
): Promise<Movie[]> {
  const movies = await fetchTrendingMovies(timeWindow)

  return movies.filter((movie) => movie.poster_path !== null).slice(0, count)
}

export async function getFilters() {
  const res = await fetch(
    `https://api.themoviedb.org/3/genre/movie/list?language=en-US&api_key=${TMDB_CONFIG.API_KEY}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_CONFIG.API_KEY}`,
      },
    },
  )

  const responseBody = await res.json()

  if (responseBody.genres) {
    return responseBody.genres.map((genre: { name: string; id: number }) => {
      return { label: genre.name, value: genre.id.toString() }
    }) as Array<{ label: string; value: string }>
  }
}

export interface WatchProvider {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priority: number
}

export interface WatchProvidersResponse {
  results: WatchProvider[]
}

export async function fetchWatchProviders(): Promise<WatchProvider[]> {
  if (!TMDB_CONFIG.API_KEY) {
    throw new Error('TMDB API key is not configured')
  }

  const url = `${TMDB_CONFIG.BASE_URL}/watch/providers/movie?api_key=${TMDB_CONFIG.API_KEY}&language=en-US`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      )
    }

    const data: WatchProvidersResponse = await response.json()
    console.log('Fetched watch providers:', data)
    return data.results
  } catch (error) {
    console.error('Error fetching watch providers:', error)
    throw error
  }
}

export interface DiscoverParams {
  page: number
  with_genres?: string
  with_watch_providers?: string
  'vote_average.gte'?: number
  'vote_average.lte'?: number
  watch_region?: string
  sort_by?: string
}

export async function discoverMovies(
  params: DiscoverParams,
): Promise<TMDBResponse> {
  if (!TMDB_CONFIG.API_KEY) {
    throw new Error('TMDB API key is not configured')
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_CONFIG.API_KEY,
    include_adult: 'false',
    include_video: 'false',
    language: 'en-US',
    page: params.page.toString(),
    sort_by: params.sort_by || 'popularity.desc',
    watch_region: params.watch_region || 'FI',
  })

  if (params.with_genres) {
    queryParams.append('with_genres', params.with_genres)
  }

  if (params.with_watch_providers) {
    queryParams.append('with_watch_providers', params.with_watch_providers)
  }

  if (params['vote_average.gte'] !== undefined) {
    queryParams.append(
      'vote_average.gte',
      params['vote_average.gte'].toString(),
    )
  }

  if (params['vote_average.lte'] !== undefined) {
    queryParams.append(
      'vote_average.lte',
      params['vote_average.lte'].toString(),
    )
  }

  const url = `${TMDB_CONFIG.BASE_URL}/discover/movie?${queryParams.toString()}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      )
    }

    const data: TMDBResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error discovering movies:', error)
    throw error
  }
}

export interface SearchParams {
  page: number
  query: string
}

export async function searchMovies(
  params: SearchParams,
): Promise<TMDBResponse> {
  if (!TMDB_CONFIG.API_KEY) {
    throw new Error('TMDB API key is not configured')
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_CONFIG.API_KEY,
    query: params.query,
    include_adult: 'false',
    language: 'en-US',
    page: params.page.toString(),
  })

  const url = `${TMDB_CONFIG.BASE_URL}/search/movie?${queryParams.toString()}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      )
    }

    const data: TMDBResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error searching movies:', error)
    throw error
  }
}

export async function fetchMovieDetails(
  tmdbId: number,
): Promise<TMDBMovieResponse> {
  const url = `${TMDB_CONFIG.BASE_URL}/movie/${tmdbId}?api_key=${TMDB_CONFIG.API_KEY}&append_to_response=credits,external_ids,images,similar,videos,watch/providers`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching movie details:', error)
    throw error
  }
}
