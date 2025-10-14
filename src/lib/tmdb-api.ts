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

// Configuration
const TMDB_CONFIG = {
  API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  BASE_URL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p'
}

// Helper function to build image URLs
export function getImageUrl(path: string | null, size: string = 'w500'): string | null {
  if (!path) return null
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`
}

// API service functions
export async function fetchTrendingMovies(timeWindow: TimeWindow = 'week'): Promise<Movie[]> {
  if (!TMDB_CONFIG.API_KEY) {
    throw new Error('TMDB API key is not configured')
  }

  const url = `${TMDB_CONFIG.BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_CONFIG.API_KEY}`
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
    }
    
    const data: TMDBResponse = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching trending movies:', error)
    throw error
  }
}

// Get a subset of trending movies for background
export async function fetchBackgroundMovies(count: number = 12, timeWindow: TimeWindow = 'week'): Promise<Movie[]> {
  const movies = await fetchTrendingMovies(timeWindow)
  
  // Filter out movies without poster images and take only the requested count
  return movies
    .filter(movie => movie.poster_path !== null)
    .slice(0, count)
}