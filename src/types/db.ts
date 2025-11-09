export type Shortlist = {
  id: string
  userId: string
  isReady: boolean
  participating: boolean
  user: {
    id: string
    name: string
    image: string
    email: string
  }
  movies: Array<{
    id: string
    tmdbId: number
    title: string
    originalTitle: string
    overview: string
    releaseDate: string
    voteAverage: number
    voteCount: number
    runtime?: number | null
    genres?: string[] | null
    tagline?: string | null
    images?: {
      backdrops?: Array<{ file_path: string; [key: string]: any }>
      posters?: Array<{ file_path: string; [key: string]: any }>
      logos?: Array<{ file_path: string; [key: string]: any }>
    } | null
  }>
}
