import type { TMDBMovieResponse } from '@/types/tmdb'
import { getCached, setCache } from '@/lib/tmdb-cache'

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
  genre_ids: Array<number>
  adult: boolean
  original_language: string
  original_title: string
  popularity: number
  video: boolean
}

export interface TMDBResponse {
  page: number
  results: Array<Movie>
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
): Promise<Array<Movie>> {
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
): Promise<Array<Movie>> {
  const movies = await fetchTrendingMovies(timeWindow)

  return movies.filter((movie) => movie.poster_path !== null).slice(0, count)
}

const GENRES_CACHE_KEY = 'tmdb:genres'
const GENRES_TTL = 1000 * 60 * 60 * 24 * 7 // 7 days

export async function getFilters() {
  const cached =
    getCached<Array<{ label: string; value: string }>>(GENRES_CACHE_KEY)
  if (cached) return cached

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
    const genres = responseBody.genres.map(
      (genre: { name: string; id: number }) => {
        return { label: genre.name, value: genre.id.toString() }
      },
    ) as Array<{ label: string; value: string }>
    setCache(GENRES_CACHE_KEY, genres, GENRES_TTL)
    return genres
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
  results: Array<WatchProvider>
}

const PROVIDERS_CACHE_KEY = 'tmdb:watchProviders'
const PROVIDERS_TTL = 1000 * 60 * 60 * 24 // 24 hours

export async function fetchWatchProviders(): Promise<Array<WatchProvider>> {
  if (!TMDB_CONFIG.API_KEY) {
    throw new Error('TMDB API key is not configured')
  }

  const cached = getCached<Array<WatchProvider>>(PROVIDERS_CACHE_KEY)
  if (cached) return cached

  const url = `${TMDB_CONFIG.BASE_URL}/watch/providers/movie?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&watch_region=FI`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      )
    }

    const data: WatchProvidersResponse = await response.json()

    setCache(PROVIDERS_CACHE_KEY, data.results, PROVIDERS_TTL)
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
  with_original_language?: string
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

  if (params.with_original_language) {
    queryParams.append('with_original_language', params.with_original_language)
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

export interface Language {
  iso_639_1: string
  english_name: string
  name: string
}

export const COMMON_LANGUAGES: Array<Language> = [
  { iso_639_1: 'en', english_name: 'English', name: 'English' },
  { iso_639_1: 'es', english_name: 'Spanish', name: 'Español' },
  { iso_639_1: 'fr', english_name: 'French', name: 'Français' },
  { iso_639_1: 'de', english_name: 'German', name: 'Deutsch' },
  { iso_639_1: 'ja', english_name: 'Japanese', name: '日本語' },
  { iso_639_1: 'ko', english_name: 'Korean', name: '한국어' },
  { iso_639_1: 'zh', english_name: 'Mandarin', name: '普通话' },
  { iso_639_1: 'hi', english_name: 'Hindi', name: 'हिन्दी' },
  { iso_639_1: 'it', english_name: 'Italian', name: 'Italiano' },
  { iso_639_1: 'ru', english_name: 'Russian', name: 'Русский' },
  { iso_639_1: 'pt', english_name: 'Portuguese', name: 'Português' },
  { iso_639_1: 'sv', english_name: 'Swedish', name: 'Svenska' },
  { iso_639_1: 'no', english_name: 'Norwegian', name: 'Norsk' },
  { iso_639_1: 'da', english_name: 'Danish', name: 'Dansk' },
  { iso_639_1: 'fi', english_name: 'Finnish', name: 'Suomi' },
  { iso_639_1: 'nl', english_name: 'Dutch', name: 'Nederlands' },
  { iso_639_1: 'pl', english_name: 'Polish', name: 'Polski' },
  { iso_639_1: 'tr', english_name: 'Turkish', name: 'Türkçe' },
  { iso_639_1: 'ar', english_name: 'Arabic', name: 'العربية' },
  { iso_639_1: 'th', english_name: 'Thai', name: 'ไทย' },
  { iso_639_1: 'vi', english_name: 'Vietnamese', name: 'Tiếng Việt' },
  { iso_639_1: 'id', english_name: 'Indonesian', name: 'Bahasa Indonesia' },
  { iso_639_1: 'ta', english_name: 'Tamil', name: 'தமிழ்' },
  { iso_639_1: 'te', english_name: 'Telugu', name: 'తెలుగు' },
  { iso_639_1: 'ml', english_name: 'Malayalam', name: 'മലയാളം' },
]

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
