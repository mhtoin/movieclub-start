/**
 * Import script to load exported CSV data into local PostgreSQL database
 * Transforms data to match the new schema (lowercase table names, dropped columns)
 * Run with: pnpm db:import
 */
import bcrypt from 'bcryptjs'
import { parse } from 'csv-parse/sync'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import postgres from 'postgres'

// Default password for imported users (they should change this)
const DEFAULT_PASSWORD = 'changeme'

const EXPORT_DIR = path.join(process.cwd(), 'data', 'exports')

// Local database URL (uses docker-compose defaults if not set)
const LOCAL_DATABASE_URL =
  process.env.LOCAL_DATABASE_URL ||
  'postgresql://movieclub:movieclub_dev_password@localhost:5432/movieclub_dev'

// Columns to drop from Movie table
const MOVIE_COLUMNS_TO_DROP = [
  'backdrop_path',
  'genre_ids',
  'poster_path',
  'movieOfTheWeek',
  'shortlistIDs',
  'raffleIDs',
]

// Columns to drop from Shortlist table
const SHORTLIST_COLUMNS_TO_DROP = ['movieIDs']

// Columns to drop from Raffle table
const RAFFLE_COLUMNS_TO_DROP = ['participantIDs', 'movieIDs']

// Columns to drop from User table
const USER_COLUMNS_TO_DROP = ['raffleIDs']

// Columns to drop from Tierlist table
const TIERLIST_COLUMNS_TO_DROP = ['tierIds', 'watchDate']

// Table name mapping (old PascalCase -> new snake_case)
const TABLE_NAME_MAP: Record<string, string> = {
  User: 'user',
  Account: 'account',
  Shortlist: 'shortlist',
  Movie: 'movie',
  _MovieToShortlist: '_movie_to_shortlist',
  Raffle: 'raffle',
  _RaffleToUser: '_raffle_to_user',
  _MovieToRaffle: '_movie_to_raffle',
  Review: 'review',
  RecommendedMovie: 'recommended_movie',
  Tierlist: 'tierlist',
  Tier: 'tier',
  MoviesOnTiers: 'movies_on_tiers',
  SiteConfig: 'site_config',
}

// Import order (respects foreign key dependencies)
const IMPORT_ORDER = [
  'User',
  'Account',
  'Shortlist',
  'Movie',
  '_MovieToShortlist',
  'Raffle',
  '_RaffleToUser',
  '_MovieToRaffle',
  'Review',
  'RecommendedMovie',
  'Tierlist',
  'Tier',
  'MoviesOnTiers',
  'SiteConfig',
]

// Delete order (reverse of import order to respect foreign keys)
const DELETE_ORDER = [...IMPORT_ORDER].reverse()

function readCsvFile(tableName: string): Record<string, unknown>[] | null {
  const filePath = path.join(EXPORT_DIR, `${tableName}.csv`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    cast: (value) => {
      // Handle empty strings as null
      if (value === '') {
        return null
      }
      // Try to parse JSON for array/object columns
      if (value.startsWith('[') || value.startsWith('{')) {
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      }
      // Handle boolean strings
      if (value === 'true') return true
      if (value === 'false') return false
      return value
    },
  }) as Record<string, unknown>[]

  return records
}

function transformRow(
  tableName: string,
  row: Record<string, unknown>,
): Record<string, unknown> | null {
  const transformed = { ...row }

  // Drop columns based on table
  let columnsToDrop: string[] = []
  switch (tableName) {
    case 'Movie':
      columnsToDrop = MOVIE_COLUMNS_TO_DROP
      // Set defaults for NOT NULL columns that may be null in old data
      if (transformed.adult === null || transformed.adult === undefined) {
        transformed.adult = false
      }
      if (transformed.video === null || transformed.video === undefined) {
        transformed.video = false
      }
      if (transformed.overview === null || transformed.overview === undefined) {
        transformed.overview = ''
      }
      if (
        transformed.release_date === null ||
        transformed.release_date === undefined
      ) {
        transformed.release_date = ''
      }
      break
    case 'Shortlist':
      columnsToDrop = SHORTLIST_COLUMNS_TO_DROP
      // Set defaults for NOT NULL columns
      if (transformed.isReady === null || transformed.isReady === undefined) {
        transformed.isReady = false
      }
      if (
        transformed.participating === null ||
        transformed.participating === undefined
      ) {
        transformed.participating = true
      }
      break
    case 'Raffle':
      columnsToDrop = RAFFLE_COLUMNS_TO_DROP
      break
    case 'User':
      columnsToDrop = USER_COLUMNS_TO_DROP
      // Set defaults for NOT NULL columns that may be null in old data
      if (transformed.radarrEnabled === null) {
        transformed.radarrEnabled = false
      }
      if (transformed.radarrMonitored === null) {
        transformed.radarrMonitored = true
      }
      if (!transformed.colorScheme) {
        transformed.colorScheme = 'default'
      }
      // Set default password for users without one
      if (!transformed.password) {
        transformed.password = bcrypt.hashSync(DEFAULT_PASSWORD, 10)
      }
      break
    case 'Tierlist':
      columnsToDrop = TIERLIST_COLUMNS_TO_DROP
      break
  }

  for (const col of columnsToDrop) {
    delete transformed[col]
  }

  return transformed
}

async function importTable(
  sql: postgres.Sql,
  oldTableName: string,
): Promise<number> {
  const newTableName = TABLE_NAME_MAP[oldTableName]
  console.log(`  Importing "${oldTableName}" → "${newTableName}"...`)

  const rows = readCsvFile(oldTableName)

  if (!rows || rows.length === 0) {
    console.log(`    → No data to import (skipping)`)
    return 0
  }

  // Transform rows
  const transformedRows = rows
    .map((row) => transformRow(oldTableName, row))
    .filter((row): row is Record<string, unknown> => row !== null)

  if (transformedRows.length === 0) {
    console.log(`    → No rows after transformation (skipping)`)
    return 0
  }

  // Get column names from first row
  const columns = Object.keys(transformedRows[0])

  // Build insert query
  // We need to handle the insert carefully for each row
  let insertedCount = 0
  const failedRows: { row: Record<string, unknown>; error: string }[] = []

  for (const row of transformedRows) {
    try {
      const values = columns.map((col) => {
        const value = row[col]
        // Handle arrays - PostgreSQL needs them in a specific format
        if (Array.isArray(value)) {
          return value
        }
        // Handle objects/JSONB
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value)
        }
        return value
      }) as postgres.ParameterOrJSON<never>[]

      // Build parameterized query
      const columnList = columns.map((c) => `"${c}"`).join(', ')
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
      const query = `INSERT INTO "${newTableName}" (${columnList}) VALUES (${placeholders})`

      await sql.unsafe(query, values)
      insertedCount++
    } catch (error) {
      failedRows.push({
        row,
        error: (error as Error).message,
      })
    }
  }

  console.log(`    → ${insertedCount}/${transformedRows.length} rows imported`)

  // Log failed rows with identifying information
  if (failedRows.length > 0) {
    console.log(`    ⚠️ ${failedRows.length} rows failed to import:`)
    for (const { row, error } of failedRows) {
      const identifier =
        row.title ||
        row.id ||
        row.tmdbId ||
        JSON.stringify(row).substring(0, 100)
      console.log(`      - ${identifier}: ${error}`)
    }
  }

  return insertedCount
}

async function main() {
  console.log('🚀 Starting local database import...\n')
  console.log(`Source directory: ${EXPORT_DIR}`)
  console.log(
    `Target database: ${LOCAL_DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`,
  )

  if (!fs.existsSync(EXPORT_DIR)) {
    throw new Error(
      `Export directory not found: ${EXPORT_DIR}\nRun "pnpm db:export" first.`,
    )
  }

  // Connect to local database
  const sql = postgres(LOCAL_DATABASE_URL)

  try {
    // Test connection
    await sql`SELECT 1`
    console.log('✅ Connected to local database\n')

    // Wipe existing data before importing (in reverse order to respect foreign keys)
    console.log('🗑️  Wiping existing data...')
    for (const oldTableName of DELETE_ORDER) {
      const newTableName = TABLE_NAME_MAP[oldTableName]
      try {
        const result = await sql.unsafe(`DELETE FROM "${newTableName}"`)
        if (result.count > 0) {
          console.log(`    Deleted ${result.count} rows from "${newTableName}"`)
        }
      } catch (error) {
        // Table might not exist yet, that's fine
        if (!(error as Error).message.includes('does not exist')) {
          throw error
        }
      }
    }
    console.log('✅ Database wiped\n')

    let totalRows = 0

    // Import each table in order
    for (const table of IMPORT_ORDER) {
      const count = await importTable(sql, table)
      totalRows += count
    }

    console.log(`\n✅ Import complete! Total rows: ${totalRows}`)
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error('❌ Import failed:', error)
  process.exit(1)
})
