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

const TMDB_IMAGE_CANDIDATES = {
  poster: ['w92', 'w154', 'w185', 'w342', 'w500'],
  backdrop: ['w300', 'w780', 'w1280'],
} as const

type TmdbImageVariant = keyof typeof TMDB_IMAGE_CANDIDATES

export function getImageUrl(
  path: string | null,
  size: string = 'w500',
): string | null {
  if (!path) return null
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`
}

function getTmdbWidthDescriptor(size: string): string {
  const width = Number.parseInt(size.slice(1), 10)
  return Number.isFinite(width) ? `${width}w` : size
}

export function getResponsiveImageProps(
  path: string | null,
  variant: TmdbImageVariant,
  fallbackSize?: string,
) {
  if (!path) return null

  const candidates = TMDB_IMAGE_CANDIDATES[variant]
  const src =
    getImageUrl(path, fallbackSize ?? candidates[candidates.length - 1]) ?? ''
  const srcSet = candidates
    .map((size) => `${getImageUrl(path, size)} ${getTmdbWidthDescriptor(size)}`)
    .join(', ')

  return { src, srcSet }
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
  display_priorities: { [key: string]: number }
}

export interface WatchProvidersResponse {
  results: WatchProvider[]
}

export async function fetchWatchProviders(): Promise<WatchProvider[]> {
  if (!TMDB_CONFIG.API_KEY) {
    throw new Error('TMDB API key is not configured')
  }

  const url = `${TMDB_CONFIG.BASE_URL}/watch/providers/movie?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&watch_region=FI`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      )
    }

    const data: WatchProvidersResponse = await response.json()

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

export const FALLBACK_POSTERS: Array<Movie> = [
  {
    id: 155,
    title: 'The Dark Knight',
    overview: '',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: null,
    release_date: '2008-07-16',
    vote_average: 9.0,
    vote_count: 30000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'The Dark Knight',
    popularity: 500,
    video: false,
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: '',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: null,
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 35000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'Interstellar',
    popularity: 400,
    video: false,
  },
  {
    id: 27205,
    title: 'Inception',
    overview: '',
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: null,
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 40000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'Inception',
    popularity: 450,
    video: false,
  },
  {
    id: 238,
    title: 'The Godfather',
    overview: '',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: null,
    release_date: '1972-03-14',
    vote_average: 8.7,
    vote_count: 20000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'The Godfather',
    popularity: 300,
    video: false,
  },
  {
    id: 603,
    title: 'The Matrix',
    overview: '',
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdrop_path: null,
    release_date: '1999-03-30',
    vote_average: 8.2,
    vote_count: 28000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'The Matrix',
    popularity: 350,
    video: false,
  },
  {
    id: 550,
    title: 'Fight Club',
    overview: '',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: null,
    release_date: '1999-10-15',
    vote_average: 8.4,
    vote_count: 27000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'Fight Club',
    popularity: 320,
    video: false,
  },
  {
    id: 13,
    title: 'Forrest Gump',
    overview: '',
    poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    backdrop_path: null,
    release_date: '1994-06-23',
    vote_average: 8.5,
    vote_count: 26000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'Forrest Gump',
    popularity: 280,
    video: false,
  },
  {
    id: 496243,
    title: 'Parasite',
    overview: '',
    poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdrop_path: null,
    release_date: '2019-05-30',
    vote_average: 8.5,
    vote_count: 18000,
    genre_ids: [],
    adult: false,
    original_language: 'ko',
    original_title: 'Gisaengchung',
    popularity: 250,
    video: false,
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    overview: '',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdrop_path: null,
    release_date: '1994-09-23',
    vote_average: 8.7,
    vote_count: 24000,
    genre_ids: [],
    adult: false,
    original_language: 'en',
    original_title: 'The Shawshank Redemption',
    popularity: 200,
    video: false,
  },
]
