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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.id,
    data: { movie },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      key={movie.id}
      className={`w-32 transition-all duration-200 ${
        isDragging
          ? 'scale-105 rotate-3 cursor-grabbing z-50'
          : 'hover:scale-105 hover:-translate-y-1 cursor-grab'
      }`}
      ref={setNodeRef}
      {...props}
      {...attributes}
      {...listeners}
      style={style}
    >
      <div
        className={`rounded-lg overflow-hidden ${
          isDragging
            ? 'shadow-2xl ring-2 ring-primary'
            : 'shadow-md hover:shadow-xl'
        }`}
      >
        <MovieCard movie={mapDbMovieToTmdbMovie(movie)} />
      </div>
    </div>
  )
}
