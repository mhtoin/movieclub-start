import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
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
  items: T[],
  keyFn: (item: T) => string | undefined,
): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item) ?? 'undefined'
      ;(acc[key] ??= []).push(item)
      return acc
    },
    {} as Record<string, T[]>,
  )
}
