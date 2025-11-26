import { movie as movieSchema } from '@/db/schema/movies'
import { type Movie as TMDBMovie } from '@/lib/tmdb-api'
import { DragOverlay, useDndContext } from '@dnd-kit/core'
import { InferSelectModel } from 'drizzle-orm'
import { MovieCard } from '../discover/movie-card'

type Movie = InferSelectModel<typeof movieSchema>

const mapDbMovieToTmdbMovie = (dbMovie: Movie): TMDBMovie => ({
  id: dbMovie.tmdbId,
  title: dbMovie.title,
  overview: dbMovie.overview,
  poster_path: (dbMovie.images as any)?.posters?.[0]?.file_path ?? null,
  backdrop_path: (dbMovie.images as any)?.backdrops?.[0]?.file_path ?? null,
  release_date: dbMovie.releaseDate,
  vote_average: dbMovie.voteAverage ?? 0,
  vote_count: dbMovie.voteCount,
  genre_ids: [],
  adult: dbMovie.adult,
  original_language: dbMovie.originalLanguage,
  original_title: dbMovie.originalTitle,
  popularity: dbMovie.popularity,
  video: dbMovie.video,
})

export default function DragOverlayPortal() {
  const { active } = useDndContext()
  const movie = active?.data.current?.movie as Movie | undefined

  return (
    <DragOverlay>
      {movie ? (
        <div className="w-32 cursor-grabbing">
          <MovieCard movie={mapDbMovieToTmdbMovie(movie)} />
        </div>
      ) : null}
    </DragOverlay>
  )
}
