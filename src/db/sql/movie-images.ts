import { sql } from 'drizzle-orm'
import type { AnyColumn, SQL } from 'drizzle-orm'

export type CompactedMovieImage = {
  file_path: string
}

export type CompactedMovieImages = {
  posters: Array<CompactedMovieImage>
  backdrops: Array<CompactedMovieImage>
}

/**
 * Some rows store images as a JSON-encoded string (double encoded). Decode
 * those so they keep the same poster/backdrop data they expose today.
 */
function normalizedMovieImages(imagesColumn: AnyColumn): SQL {
  return sql`case
    when jsonb_typeof(${imagesColumn}) = 'string'
      and pg_input_is_valid(${imagesColumn} #>> '{}', 'jsonb')
      then (${imagesColumn} #>> '{}')::jsonb
    else ${imagesColumn}
  end`
}

/**
 * Builds a JSONB expression that strips the large base64 blur placeholders from
 * `movie.images`, keeping only the TMDB file paths used for rendering.
 *
 * Null images stay null, while a present-but-empty images object becomes
 * `{ posters: [], backdrops: [] }` so consumers can keep their existing
 * optional chaining.
 */
export function compactMovieImages(
  imagesColumn: AnyColumn,
): SQL<CompactedMovieImages | null> {
  const normalizedImages = normalizedMovieImages(imagesColumn)

  return sql<CompactedMovieImages | null>`case
    when ${imagesColumn} is null
      or jsonb_typeof(${imagesColumn}) = 'null' then null
    else jsonb_build_object(
      'posters',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object('file_path', poster.value->>'file_path')
            order by poster.ordinality
          )
          from jsonb_array_elements(
            case
              when jsonb_typeof(${normalizedImages}->'posters') = 'array'
                then ${normalizedImages}->'posters'
              else '[]'::jsonb
            end
          ) with ordinality as poster(value, ordinality)
          where poster.value->>'file_path' is not null
        ),
        '[]'::jsonb
      ),
      'backdrops',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object('file_path', backdrop.value->>'file_path')
            order by backdrop.ordinality
          )
          from jsonb_array_elements(
            case
              when jsonb_typeof(${normalizedImages}->'backdrops') = 'array'
                then ${normalizedImages}->'backdrops'
              else '[]'::jsonb
            end
          ) with ordinality as backdrop(value, ordinality)
          where backdrop.value->>'file_path' is not null
        ),
        '[]'::jsonb
      )
    )
  end`
}

/**
 * Extracts the first poster's TMDB file path without loading the images JSON.
 */
export function firstMoviePosterPath(
  imagesColumn: AnyColumn,
): SQL<string | null> {
  return sql<
    string | null
  >`${normalizedMovieImages(imagesColumn)}->'posters'->0->>'file_path'`
}

/**
 * Compacts image JSON returned by Drizzle relational queries that cannot use a
 * scalar SQL projection. Keep only the paths used by the UI, including legacy
 * rows where the JSONB value was stored as a JSON-encoded string.
 */
export function compactMovieImageData(
  images: unknown,
): CompactedMovieImages | null {
  let value = images

  if (typeof value === 'string') {
    try {
      value = JSON.parse(value) as unknown
    } catch {
      return { posters: [], backdrops: [] }
    }
  }

  if (value === null || value === undefined) return null
  if (typeof value !== 'object' || Array.isArray(value)) {
    return { posters: [], backdrops: [] }
  }

  const source = value as Record<string, unknown>
  const compactPaths = (candidate: unknown): Array<CompactedMovieImage> => {
    if (!Array.isArray(candidate)) return []

    return candidate.flatMap((image) => {
      if (
        !image ||
        typeof image !== 'object' ||
        typeof (image as Record<string, unknown>).file_path !== 'string'
      ) {
        return []
      }

      return [{ file_path: (image as Record<string, string>).file_path }]
    })
  }

  return {
    posters: compactPaths(source.posters),
    backdrops: compactPaths(source.backdrops),
  }
}

type TierlistMovieImageShape = {
  tiers: Array<{
    moviesOnTiers: Array<{ movie: { images: unknown } }>
  }>
}

/** Strips unused image metadata from a relational tierlist result. */
export function compactTierlistMovieImages<T extends TierlistMovieImageShape>(
  tierlist: T,
): T {
  return {
    ...tierlist,
    tiers: tierlist.tiers.map((tier) => ({
      ...tier,
      moviesOnTiers: tier.moviesOnTiers.map((entry) => ({
        ...entry,
        movie: {
          ...entry.movie,
          images: compactMovieImageData(entry.movie.images),
        },
      })),
    })),
  } as T
}
