import { movie } from '@/db/schema/movies'
import { type Movie as TMDBMovie } from '@/lib/tmdb-api'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { InferSelectModel } from 'drizzle-orm'
import { MovieCard } from '../discover/movie-card'

type Movie = InferSelectModel<typeof movie>

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

export default function TierItem({
  movie,
  ref,
  ...props
}: {
  movie: Movie & { position: number }
  ref?: React.Ref<HTMLDivElement>
  [key: string]: any
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.id,
      data: { movie },
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div
      key={movie.id}
      className="w-32"
      ref={setNodeRef}
      {...props}
      {...attributes}
      {...listeners}
      style={style}
    >
      <MovieCard movie={mapDbMovieToTmdbMovie(movie)} />
    </div>
  )
}
