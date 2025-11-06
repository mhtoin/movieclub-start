import { db } from '@/db/db'
import { movie } from '@/db/schema'
import { Image, TMDBMovieResponse } from '@/types/tmdb'
import { eq } from 'drizzle-orm'
import { getBlurDataUrl } from './utils'

type RankObject = {
  [key: string]: {
    image: Image
    points: number
  }
}

function rankImages(images: Array<Image>, originalLanguage: string) {
  const rankObject: RankObject = images.reduce((acc, image) => {
    let points = 0
    if (
      image.iso_639_1 === 'en' ||
      image.iso_639_1 === originalLanguage ||
      !image.iso_639_1
    ) {
      points += 3
    } else {
      points -= 1
    }
    if (image.vote_average > 5) {
      points += 2
    }
    if (image.vote_average > 0) {
      points += 1
    }
    if (image.height > 1920 && image.width > 1080) {
      points += 2
    }

    if (image.height === 1920 && image.width === 1080) {
      points += 1
    }
    acc[image.file_path] = {
      image,
      points: points,
    }
    return acc
  }, {} as RankObject)

  return Object.values(rankObject)
    .sort((a, b) => b.points - a.points)
    .map((image) => image.image)
}

export const createDbMovie = async (movieData: TMDBMovieResponse) => {
  const finnishProvider = [
    ...(movieData['watch/providers']?.results?.FI?.flatrate ?? []),
    ...(movieData['watch/providers']?.results?.FI?.free ?? []),
  ]

  const providerLink = movieData['watch/providers']?.results?.FI?.link
  const cast = movieData.credits?.cast
  const crew = movieData.credits?.crew.filter(
    (crew) =>
      crew.job === 'Director' ||
      crew.job === 'Screenplay' ||
      crew.job === 'Original Music Composer',
  )

  const trailers = movieData.videos?.results.filter(
    (video) => video.type === 'Trailer',
  )

  const backdrops = movieData.images?.backdrops
    ? rankImages(movieData.images.backdrops, movieData.original_language)
    : []

  const posters = movieData.images?.posters
    ? rankImages(movieData.images.posters, movieData.original_language)
    : []

  const backdropsWithBlurDataUrl = backdrops.slice(0, 3).map((backdrop) => ({
    ...backdrop,
    blurDataUrl: '',
  }))

  const postersWithBlurDataUrl = posters.slice(0, 3).map((poster) => ({
    ...poster,
    blurDataUrl: '',
  }))

  const logos = movieData.images?.logos.filter(
    (image) => image.iso_639_1 === 'en' || image.vote_average > 0,
  )

  return {
    adult: movieData.adult,
    tmdbId: movieData.id,
    imdbId: movieData.imdb_id,
    originalLanguage: movieData.original_language,
    originalTitle: movieData.original_title,
    overview: movieData.overview,
    popularity: movieData.popularity,
    releaseDate: movieData.release_date,
    title: movieData.title,
    video: movieData.video,
    voteAverage: movieData.vote_average,
    voteCount: movieData.vote_count,
    runtime: movieData.runtime,
    tagline: movieData.tagline,
    genres: movieData.genres.map((genre) => genre.name),
    watchProviders: {
      link: providerLink ?? '',
      providers: finnishProvider ?? [],
    },
    images: {
      backdrops: backdropsWithBlurDataUrl,
      posters: postersWithBlurDataUrl,
      logos,
    },
    videos: trailers,
    cast: cast,
    crew: crew,
  }
}

/**
 * Generates blur data URLs for movie images asynchronously and updates the database.
 * This function runs in the background without blocking movie creation.
 *
 * @param movieId - The database ID of the movie to update
 * @param images - The images object from the movie data (containing backdrops and posters)
 */
export async function generateAndUpdateBlurData(
  movieId: string,
  images: {
    backdrops: Array<Image>
    posters: Array<Image>
    logos: any
  },
): Promise<void> {
  try {
    // Generate blur data for all images in parallel
    const [backdropsWithBlur, postersWithBlur] = await Promise.all([
      Promise.all(
        images.backdrops.map(async (backdrop) => {
          const blurDataUrl = await getBlurDataUrl(
            `https://image.tmdb.org/t/p/w300/${backdrop.file_path}`,
          )
          return {
            ...backdrop,
            blurDataUrl,
          }
        }),
      ),
      Promise.all(
        images.posters.map(async (poster) => {
          const blurDataUrl = await getBlurDataUrl(
            `https://image.tmdb.org/t/p/w92/${poster.file_path}`,
          )
          return {
            ...poster,
            blurDataUrl,
          }
        }),
      ),
    ])

    // Update the movie in the database with blur data
    await db
      .update(movie)
      .set({
        images: {
          backdrops: backdropsWithBlur,
          posters: postersWithBlur,
          logos: images.logos,
        },
      })
      .where(eq(movie.id, movieId))
  } catch (error) {
    console.error(`Failed to generate blur data for movie ${movieId}:`, error)
  }
}
