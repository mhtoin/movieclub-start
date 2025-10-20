import { Image, TMDBMovieResponse } from "@/types/tmdb";
import { getBlurDataUrl } from "./utils";

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
      image.iso_639_1 === "en" ||
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

export const createDbMovie = async (
  movieData: TMDBMovieResponse,
) => {
    const finnishProvider = [
    ...(movieData["watch/providers"]?.results?.FI?.flatrate ?? []),
    ...(movieData["watch/providers"]?.results?.FI?.free ?? []),
  ]

  const providerLink = movieData["watch/providers"]?.results?.FI?.link
  const cast = movieData.credits?.cast
  const crew = movieData.credits?.crew.filter(
    (crew) =>
      crew.job === "Director" ||
      crew.job === "Screenplay" ||
      crew.job === "Original Music Composer",
  )

  const trailers = movieData.videos?.results.filter(
    (video) => video.type === "Trailer",
  )

  const backdrops = movieData.images?.backdrops
    ? rankImages(movieData.images.backdrops, movieData.original_language)
    : []
  const backdropsWithBlurDataUrl: Array<Image> = []

  for (const backdrop of backdrops.slice(0, 3)) {
    const blurDataUrl = await getBlurDataUrl(
      `https://image.tmdb.org/t/p/w300/${backdrop.file_path}`,
    )
    const backdropWithBlurDataUrl = {
      ...backdrop,
      blurDataUrl,
    }
    backdropsWithBlurDataUrl.push(backdropWithBlurDataUrl)
  }

  // include only english posters
  const posters = movieData.images?.posters
    ? rankImages(movieData.images.posters, movieData.original_language)
    : []
  const postersWithBlurDataUrl: Array<Image> = []

  for (const poster of posters.slice(0, 3)) {
    const blurDataUrl = await getBlurDataUrl(
      `https://image.tmdb.org/t/p/w92/${poster.file_path}`,
    )
    const posterWithBlurDataUrl = {
      ...poster,
      blurDataUrl,
    }
    postersWithBlurDataUrl.push(posterWithBlurDataUrl)
  }
  const logos = movieData.images?.logos.filter(
    (image) => image.iso_639_1 === "en" || image.vote_average > 0,
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
      link: providerLink ?? "",
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