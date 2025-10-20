export interface TMDBMovieResponse {
  adult: boolean
  backdrop_path: string | null
  belongs_to_collection: null | object 
  budget: number
  genres: Genre[]
  homepage: string
  id: number
  imdb_id?: string
  origin_country: string[]
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string | null
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  release_date: string
  revenue: number
  runtime: number
  spoken_languages: SpokenLanguage[]
  status:
    | "Released"
    | "Post Production"
    | "In Production"
    | "Planned"
    | "Canceled"
  tagline: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
  credits: Credits
  "watch/providers"?: WatchProviders // Simplified version, can expand as needed
  images?: {
    backdrops: Image[]
    posters: Image[]
    logos: Image[]
  }

  similar?: {
    page: number
    results: SimilarMovie[]
    total_pages: number
    total_results: number
  }

  // For video data if needed
  videos?: {
    results: Video[]
  }
}

export interface TMDBRecommendationResponse {
  page: number
  results: SimilarMovie[]
  total_pages: number
  total_results: number
}

export interface Image {
  aspect_ratio: number
  height: number
  iso_639_1: string | null
  file_path: string
  vote_average: number
  vote_count: number
  width: number
}

export interface SimilarMovie {
  adult: boolean
  backdrop_path: string | null
  genre_ids: number[]
  id: number
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string | null
  release_date: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

export interface Video {
  iso_639_1: string
  iso_3166_1: string
  name: string
  key: string
  site: string
  size: number
  type: string
  official: boolean
  published_at: string
  id: string
}

export interface Genre {
  id: number
  name: string
}

export interface ProductionCompany {
  id: number
  logo_path?: string
  name: string
  origin_country: string
}

export interface ProductionCountry {
  iso_3166_1: string
  name: string
}

export interface SpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

export interface Credits {
  cast: CastMember[]
  crew: CrewMember[]
}

export interface CastMember {
  adult: boolean
  gender: number
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path?: string
  cast_id: number
  character: string
  credit_id: string
  order: number
}

export interface CrewMember {
  adult: boolean
  gender: number
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path?: string
  credit_id: string
  department: string
  job: string
}

export interface WatchProviders {
  results: {
    [key: string]: {
      link: string
      flatrate: Provider[]
      free: Provider[]
    }
  }
}

export interface Provider {
  logo_path: string
  provider_id: number
  provider_name: string
  display_priority: number
}

export interface TMDBSearchResponse {
  page: number
  results: TMDBSearchResult[]
  total_pages: number
  total_results: number
}

export interface TMDBSearchResult {
  adult: boolean
  backdrop_path: string | null
  genre_ids: number[]
  id: number
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string | null
  release_date: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}
