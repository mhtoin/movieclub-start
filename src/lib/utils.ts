import { clsx } from 'clsx'
import { format } from 'date-fns'
import type { ClassValue } from 'clsx'
import type { Movie } from '@/db/schema/movies'
import { getImageUrl } from '@/lib/tmdb-api'

export function cn(...inputs: Array<ClassValue>) {
  return clsx(inputs)
}

export function getMoviePosterUrl(movie: Movie, size = 'w500'): string | null {
  const path = (movie.images as any)?.posters?.[0]?.file_path
  return path ? getImageUrl(path, size) : null
}

export function getMovieBackdropUrl(
  movie: Movie,
  size = 'w1280',
): string | null {
  const path = (movie.images as any)?.backdrops?.[0]?.file_path
  return path ? getImageUrl(path, size) : null
}

/**
 * Formats a raffle date string to a human-readable format.
 * Falls back to the raw string if parsing fails.
 */
export function formatRaffleDate(date: string | Date): string {
  try {
    return format(new Date(date), 'dd MMM yyyy')
  } catch {
    return String(date)
  }
}

export async function getBlurDataUrl(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:image/jpeg;base64,${base64}`
  } catch (error) {
    console.error('Error generating blur data URL:', error)
    return '' // Return empty string as fallback
  }
}

export function groupBy<T>(
  items: Array<T>,
  keyFn: (item: T) => string | undefined,
): Record<string, Array<T>> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item) ?? 'undefined'
      ;(acc[key] ??= []).push(item)
      return acc
    },
    {} as Record<string, Array<T>>,
  )
}
