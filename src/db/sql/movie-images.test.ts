import { describe, expect, it } from 'vitest'
import {
  compactMovieImageData,
  compactTierlistMovieImages,
} from './movie-images'

describe('compactMovieImageData', () => {
  it('keeps only poster and backdrop file paths', () => {
    expect(
      compactMovieImageData({
        posters: [
          {
            file_path: '/poster.jpg',
            blurDataUrl: 'data:image/jpeg;base64,...',
          },
        ],
        backdrops: [{ file_path: '/backdrop.jpg', width: 1920 }],
        logos: [{ file_path: '/logo.svg' }],
      }),
    ).toEqual({
      posters: [{ file_path: '/poster.jpg' }],
      backdrops: [{ file_path: '/backdrop.jpg' }],
    })
  })

  it('compacts legacy double-encoded JSON values', () => {
    expect(
      compactMovieImageData(
        JSON.stringify({ posters: [{ file_path: '/legacy.jpg' }] }),
      ),
    ).toEqual({ posters: [{ file_path: '/legacy.jpg' }], backdrops: [] })
  })

  it('preserves null and safely handles malformed values', () => {
    expect(compactMovieImageData(null)).toBeNull()
    expect(compactMovieImageData('{bad json')).toEqual({
      posters: [],
      backdrops: [],
    })
    expect(compactMovieImageData(42)).toEqual({ posters: [], backdrops: [] })
  })
})

describe('compactTierlistMovieImages', () => {
  it('compacts images for each ranked movie without mutating the input', () => {
    const tierlist = {
      title: 'Favorites',
      tiers: [
        {
          label: 'S',
          moviesOnTiers: [
            {
              position: 0,
              movie: {
                id: 'movie-1',
                images: {
                  posters: [
                    {
                      file_path: '/poster.jpg',
                      blurDataUrl: 'data:image/jpeg;base64,...',
                    },
                  ],
                  logos: [{ file_path: '/logo.svg' }],
                },
              },
            },
          ],
        },
      ],
    }

    const compacted = compactTierlistMovieImages(tierlist)

    expect(compacted.tiers[0]?.moviesOnTiers[0]?.movie.images).toEqual({
      posters: [{ file_path: '/poster.jpg' }],
      backdrops: [],
    })
    expect(tierlist.tiers[0]?.moviesOnTiers[0]?.movie.images).toHaveProperty(
      'logos',
    )
  })
})
