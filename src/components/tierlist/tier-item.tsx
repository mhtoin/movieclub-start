import { movie } from '@/db/schema/movies'
import { type Movie as TMDBMovie } from '@/lib/tmdb-api'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { InferSelectModel } from 'drizzle-orm'
import { memo } from 'react'
import { MemoizedMovieCard } from '../discover/movie-card'

type Movie = InferSelectModel<typeof movie>

const mapDbMovieToTmdbMovie = (dbMovie: Movie): TMDBMovie => {
  let images = dbMovie.images
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images)
    } catch (e) {
      images = null
    }
  }

  return {
    id: dbMovie.tmdbId,
    title: dbMovie.title,
    overview: dbMovie.overview,
    poster_path: (images as any)?.posters?.[0]?.file_path ?? null,
    backdrop_path: (images as any)?.backdrops?.[0]?.file_path ?? null,
    release_date: dbMovie.releaseDate,
    vote_average: dbMovie.voteAverage ?? 0,
    vote_count: dbMovie.voteCount,
    genre_ids: [],
    adult: dbMovie.adult,
    original_language: dbMovie.originalLanguage,
    original_title: dbMovie.originalTitle,
    popularity: dbMovie.popularity,
    video: dbMovie.video,
  }
}

function TierItem({
  movie,
  ref,
  compact = false,
  isOwner = true,
  ...props
}: {
  movie: Movie & { position: number }
  ref?: React.Ref<HTMLDivElement>
  compact?: boolean
  isOwner?: boolean
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
    disabled: !isOwner,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      key={movie.id}
      className={`transition-all duration-200 ${
        compact ? 'w-full h-full' : 'w-32'
      } ${
        isDragging
          ? 'scale-105 rotate-3 cursor-grabbing z-50'
          : isOwner
            ? 'hover:scale-105 hover:-translate-y-1 cursor-grab'
            : 'cursor-default'
      }`}
      ref={setNodeRef}
      {...props}
      {...attributes}
      {...(isOwner ? listeners : {})}
      style={style}
    >
      <div
        className={`rounded-lg overflow-hidden h-full ${
          isDragging
            ? 'shadow-2xl ring-2 ring-primary'
            : 'shadow-md hover:shadow-xl'
        }`}
      >
        <MemoizedMovieCard
          movie={mapDbMovieToTmdbMovie(movie)}
          compact={compact}
        />
      </div>
    </div>
  )
}

export default memo(TierItem, (prevProps, nextProps) => {
  return (
    prevProps.movie.id === nextProps.movie.id &&
    prevProps.compact === nextProps.compact
  )
})
