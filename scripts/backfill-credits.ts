import 'dotenv/config'
import postgres from 'postgres'

const TMDB_API_KEY =
  process.env.VITE_TMDB_API_KEY || 'dc67470aa588a4fb256777463db93124'
const TMDB_BASE_URL =
  process.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://movieclub:movieclub_dev_password@localhost:5432/movieclub_dev'

async function fetchCredits(tmdbId: number) {
  const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} for movie ${tmdbId}`)
  }
  const data = await response.json()
  const credits = data.credits
  if (!credits) return { cast: null, crew: null }

  const cast = credits.cast || null
  const crew = credits.crew
    ? credits.crew.filter(
        (member: any) =>
          member.job === 'Director' ||
          member.job === 'Screenplay' ||
          member.job === 'Original Music Composer',
      )
    : null
  return { cast, crew }
}

async function main() {
  console.log('Backfilling movie credits from TMDB...\n')

  const sql = postgres(DATABASE_URL)

  try {
    const missingMovies = await sql.unsafe(`
      SELECT m.id, m.title, m."tmdbId"
      FROM movie m
      LEFT JOIN movie_credits mc ON mc.id = m.id
      WHERE mc.crew IS NULL OR jsonb_typeof(mc.crew) = 'null'
      ORDER BY m."watchDate" DESC NULLS LAST
    `)

    console.log(`Found ${missingMovies.length} movies missing crew data\n`)

    let updated = 0
    let failed = 0

    for (let i = 0; i < missingMovies.length; i++) {
      const movie = missingMovies[i]
      const tmdbId = movie.tmdbId

      if (!tmdbId) {
        console.log(
          `  [${i + 1}/${missingMovies.length}] Skipping "${movie.title}" (no tmdbId)`,
        )
        continue
      }

      try {
        process.stdout.write(
          `  [${i + 1}/${missingMovies.length}] Fetching "${movie.title}" (tmdbId: ${tmdbId})... `,
        )

        const { cast, crew } = await fetchCredits(tmdbId)

        await sql.unsafe(
          'INSERT INTO movie_credits (id, "cast", crew) VALUES ($1, $2, $3)' +
            ' ON CONFLICT (id) DO UPDATE SET "cast" = $2, crew = $3',
          [movie.id, cast, crew],
        )

        console.log('✓')
        updated++

        // Rate limiting: 20 requests per second (TMDB allows 40)
        if (i < missingMovies.length - 1) {
          await new Promise((r) => setTimeout(r, 100))
        }
      } catch (error) {
        console.log('✗')
        console.error(`    Error: ${(error as Error).message}`)
        failed++
      }
    }

    console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`)
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error('Script failed:', error)
  process.exit(1)
})
