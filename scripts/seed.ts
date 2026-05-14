import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { movie, movieToShortlist } from '../src/db/schema/movies'
import { shortlist } from '../src/db/schema/shortlists'
import { moviesOnTiers, tier, tierlist } from '../src/db/schema/tierlists'
import { user } from '../src/db/schema/users'
import type { TMDBMovieResponse } from '@/types/tmdb'
import { createDbMovie } from '@/lib/createDbMovie'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

if (!process.env.VITE_TMDB_API_KEY) {
  throw new Error('VITE_TMDB_API_KEY environment variable is required')
}

const queryClient = postgres(process.env.DATABASE_URL)
const db = drizzle(queryClient)

// TMDB API configuration
const TMDB_CONFIG = {
  API_KEY: process.env.VITE_TMDB_API_KEY,
  BASE_URL: 'https://api.themoviedb.org/3',
}

interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: Array<number>
  adult: boolean
  original_language: string
  original_title: string
  popularity: number
  video: boolean
}

async function fetchPopularMovies(page: number = 1): Promise<Array<TMDBMovie>> {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_CONFIG.API_KEY}&page=${page}&include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc&watch_region=FI&with_watch_providers=8%7C323%7C496`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    throw error
  }
}

async function fetchMovieDetails(tmdbId: number): Promise<TMDBMovieResponse> {
  const url = `${TMDB_CONFIG.BASE_URL}/movie/${tmdbId}?api_key=${TMDB_CONFIG.API_KEY}&append_to_response=credits,external_ids,images,similar,videos,watch/providers`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching movie details:', error)
    throw error
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getWatchDate(weeksAgo: number): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilWednesday = (3 - dayOfWeek + 7) % 7
  const thisWednesday = new Date(now)
  thisWednesday.setDate(now.getDate() + daysUntilWednesday)
  thisWednesday.setHours(0, 0, 0, 0)

  const targetDate = new Date(thisWednesday)
  targetDate.setDate(thisWednesday.getDate() - weeksAgo * 7)

  return targetDate
}

async function seed() {
  console.log('🌱 Starting database seeding...')

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...')
    await db.delete(moviesOnTiers)
    await db.delete(tier)
    await db.delete(tierlist)
    await db.delete(movieToShortlist)
    await db.delete(shortlist)
    await db.delete(movie)
    await db.delete(user)
    console.log('✅ Cleared existing data')

    console.log('Creating test users...')
    const hashedPassword = await bcrypt.hash('password123', 10)

    const testUsers = [
      {
        id: generateId('user'),
        email: 'alice@movieclub.test',
        name: 'Alice Johnson',
        password: hashedPassword,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        emailVerified: null,
        tmdbAccountId: null,
        tmdbSessionId: null,
        radarrApiKey: null,
        radarrEnabled: false,
        radarrMonitored: true,
        radarrQualityProfileId: null,
        radarrRootFolder: null,
        radarrUrl: null,
      },
      {
        id: generateId('user'),
        email: 'bob@movieclub.test',
        name: 'Bob Smith',
        password: hashedPassword,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        emailVerified: null,
        tmdbAccountId: null,
        tmdbSessionId: null,
        radarrApiKey: null,
        radarrEnabled: false,
        radarrMonitored: true,
        radarrQualityProfileId: null,
        radarrRootFolder: null,
        radarrUrl: null,
      },
      {
        id: generateId('user'),
        email: 'charlie@movieclub.test',
        name: 'Charlie Davis',
        password: hashedPassword,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
        emailVerified: null,
        tmdbAccountId: null,
        tmdbSessionId: null,
        radarrApiKey: null,
        radarrEnabled: false,
        radarrMonitored: true,
        radarrQualityProfileId: null,
        radarrRootFolder: null,
        radarrUrl: null,
      },
      {
        id: generateId('user'),
        email: 'diana@movieclub.test',
        name: 'Diana Martinez',
        password: hashedPassword,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
        emailVerified: null,
        tmdbAccountId: null,
        tmdbSessionId: null,
        radarrApiKey: null,
        radarrEnabled: false,
        radarrMonitored: true,
        radarrQualityProfileId: null,
        radarrRootFolder: null,
        radarrUrl: null,
      },
    ]

    await db.insert(user).values(testUsers)
    console.log(`✅ Created ${testUsers.length} test users`)

    console.log('Fetching movies from TMDB...')
    const allTmdbMovies: Array<TMDBMovie> = []

    const moviePages = await Promise.all(
      Array.from({ length: 7 }, (_, i) => i + 1).map(async (page) => {
        const movies = await fetchPopularMovies(page)
        console.log(`Fetched page ${page}: ${movies.length} movies`)
        return movies
      }),
    )
    for (const movies of moviePages) {
      allTmdbMovies.push(...movies)
    }

    console.log(`Total movies fetched: ${allTmdbMovies.length}`)

    const historyMovies = allTmdbMovies.slice(0, 100)
    const shortlistMovies = allTmdbMovies.slice(100, 130)

    console.log('Creating watched movies with historical data...')
    const watchedMovieIds: Array<string> = []

    const historyMovieIds = await Promise.all(
      historyMovies.map(async (tmdbMovie, i) => {
        const userIndex = i % testUsers.length
        const weeksAgo = i

        const movieDetails = await fetchMovieDetails(tmdbMovie.id)
        const movieData = await createDbMovie(movieDetails)

        const movieId = generateId('movie')

        await db.insert(movie).values({
          id: movieId,
          watchDate: getWatchDate(weeksAgo),
          userId: testUsers[userIndex].id,
          ...movieData,
        })

        if ((i + 1) % 10 === 0) {
          console.log(`Created ${i + 1}/100 watched movies`)
        }

        return movieId
      }),
    )
    watchedMovieIds.push(...historyMovieIds)

    console.log('✅ Created 100 watched movies')

    console.log('Creating shortlists...')
    const shortlistData = []

    for (const testUser of testUsers) {
      const shortlistId = generateId('shortlist')
      shortlistData.push({
        id: shortlistId,
        userId: testUser.id,
        isReady: true,
        requiresSelection: false,
        selectedIndex: null,
        participating: true,
      })
    }

    await db.insert(shortlist).values(shortlistData)
    console.log(`✅ Created ${shortlistData.length} shortlists`)

    console.log('Adding movies to shortlists...')
    const shortlistMovieData = []
    const shortlistMovieIds: Array<string> = []

    for (let i = 0; i < shortlistData.length; i++) {
      const shortlistItem = shortlistData[i]
      const numMovies = i === 0 || i === 1 ? 3 : i === 2 ? 2 : 1

      const movieEntries = await Promise.all(
        Array.from({ length: numMovies }, async (_, j) => {
          const movieIndex = i * 3 + j
          if (movieIndex >= shortlistMovies.length) return null

          const tmdbMovie = shortlistMovies[movieIndex]
          const movieDetails = await fetchMovieDetails(tmdbMovie.id)
          const movieData = await createDbMovie(movieDetails)

          const movieId = generateId('movie')

          await db.insert(movie).values({
            id: movieId,
            ...movieData,
          })

          return { movieId, shortlistId: shortlistItem.id }
        }),
      )

      for (const entry of movieEntries) {
        if (entry) {
          shortlistMovieIds.push(entry.movieId)
          shortlistMovieData.push({
            a: entry.movieId,
            b: entry.shortlistId,
          })
        }
      }

      console.log(
        `Added ${numMovies} movies to shortlist for ${testUsers[i].name}`,
      )
    }

    await db.insert(movieToShortlist).values(shortlistMovieData)
    console.log('✅ Added movies to shortlists')

    // Create tierlists for each user with 5 tiers
    console.log('Creating tierlists with 5 tiers...')
    const tierLabels = [
      'S - Masterpiece',
      'A - Excellent',
      'B - Good',
      'C - Average',
      'D - Poor',
    ]
    const tierValues = [5, 4, 3, 2, 1]

    await Promise.all(
      testUsers.map(async (testUser, userIndex) => {
        const tierlistId = generateId('tierlist')

        await db.insert(tierlist).values({
          id: tierlistId,
          userId: testUser.id,
          title: `${testUser.name}'s Rankings`,
          genres: null,
        })

        const tierIds: Array<string> = []
        for (let i = 0; i < 5; i++) {
          tierIds.push(generateId('tier'))
        }

        await Promise.all(
          tierIds.map((tierId, i) =>
            db.insert(tier).values({
              id: tierId,
              label: tierLabels[i],
              value: tierValues[i],
              tierlistId: tierlistId,
            }),
          ),
        )

        const shuffledMovieIds = watchedMovieIds.toSorted(() => {
          return Math.sin(userIndex * 1000 + Math.random()) - 0.5
        })

        const unrankedPercentage = 0.15 + userIndex * 0.03
        const moviesToRank = shuffledMovieIds.slice(
          0,
          Math.floor(shuffledMovieIds.length * (1 - unrankedPercentage)),
        )
        const unrankedCount = shuffledMovieIds.length - moviesToRank.length

        const moviesPerTier = [
          Math.floor(moviesToRank.length * 0.1),
          Math.floor(moviesToRank.length * 0.2),
          Math.floor(moviesToRank.length * 0.4),
          Math.floor(moviesToRank.length * 0.2),
          0,
        ]
        moviesPerTier[4] =
          moviesToRank.length -
          moviesPerTier.slice(0, 4).reduce((a, b) => a + b, 0)

        const movieInsertPromises: Array<Promise<unknown>> = []
        let movieOffset = 0
        for (let tierIndex = 0; tierIndex < 5; tierIndex++) {
          const moviesInThisTier = moviesPerTier[tierIndex]
          const tierId = tierIds[tierIndex]

          for (let position = 0; position < moviesInThisTier; position++) {
            const movieId = shuffledMovieIds[movieOffset + position]
            movieInsertPromises.push(
              db.insert(moviesOnTiers).values({
                id: generateId('movieOnTier'),
                position: position,
                movieId: movieId,
                tierId: tierId,
              }),
            )
          }

          movieOffset += moviesInThisTier
        }

        await Promise.all(movieInsertPromises)

        console.log(
          `✅ Created tierlist for ${testUser.name} with ${moviesToRank.length} ranked movies (${unrankedCount} unranked)`,
        )
      }),
    )

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\nTest users:')
    testUsers.forEach((u) => {
      console.log(`  - ${u.name} (${u.email}) - password: password123`)
    })
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('Seed completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
