/**
 * Export script to download data from Neon PostgreSQL database to CSV files
 * Run with: pnpm db:export
 */
import fs from 'node:fs'
import path from 'node:path'
import { stringify } from 'csv-stringify/sync'
import 'dotenv/config'
import postgres from 'postgres'

const EXPORT_DIR = path.join(process.cwd(), 'data', 'exports')

// Tables to export (in order, excluding Session and _prisma_migrations)
const TABLES_TO_EXPORT = [
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

// Track unranked tier IDs to filter MoviesOnTiers
const unrankedTierIds = new Set<string>()

async function exportTable(
  sql: postgres.Sql,
  tableName: string,
): Promise<number> {
  console.log(`  Exporting "${tableName}"...`)

  try {
    let rows: Array<Record<string, unknown>>

    if (tableName === 'Tierlist') {
      const rawRows = await sql.unsafe(`SELECT * FROM "${tableName}"`)
      rows = Array.from(rawRows as Array<Record<string, unknown>>).map(
        (row) => {
          const transformed = { ...row }
          if (
            transformed.watchDate &&
            (typeof transformed.watchDate === 'object' ||
              typeof transformed.watchDate === 'string')
          ) {
            let watchDate: { from?: string; to?: string } | null = null
            if (typeof transformed.watchDate === 'string') {
              try {
                watchDate = JSON.parse(transformed.watchDate)
              } catch {
                watchDate = null
              }
            } else {
              watchDate = transformed.watchDate as {
                from?: string
                to?: string
              }
            }
            if (watchDate) {
              if (watchDate.from) {
                transformed.watchDateFrom = watchDate.from
              }
              if (watchDate.to) {
                transformed.watchDateTo = watchDate.to
              }
            }
            delete transformed.watchDate
          }
          return transformed
        },
      )
    } else if (tableName === 'Tier') {
      const rawRows = await sql.unsafe(`SELECT * FROM "${tableName}"`)
      rows = Array.from(rawRows as Array<Record<string, unknown>>).filter(
        (row) => {
          const isUnranked =
            row.label === 'Unranked' && (row.value === 0 || row.value === '0')
          if (isUnranked) {
            unrankedTierIds.add(row.id as string)
          }
          return !isUnranked
        },
      )
    } else if (tableName === 'MoviesOnTiers') {
      const rawRows = await sql.unsafe(`SELECT * FROM "${tableName}"`)
      rows = Array.from(rawRows as Array<Record<string, unknown>>).filter(
        (row) => !unrankedTierIds.has(row.tierId as string),
      )
    } else {
      rows = await sql.unsafe(`SELECT * FROM "${tableName}"`)
    }

    if (rows.length === 0) {
      console.log(`    → 0 rows (skipping file creation)`)
      return 0
    }

    // Convert to CSV
    const csvContent = stringify(rows, {
      header: true,
      cast: {
        // Handle arrays and objects properly
        object: (value) => JSON.stringify(value),
      },
    })

    // Write to file
    const filePath = path.join(EXPORT_DIR, `${tableName}.csv`)
    fs.writeFileSync(filePath, csvContent)

    console.log(`    → ${rows.length} rows exported`)
    return rows.length
  } catch (error) {
    if ((error as Error).message.includes('does not exist')) {
      console.log(`    → Table does not exist (skipping)`)
      return 0
    }
    throw error
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is required (should point to Neon)',
    )
  }

  console.log('🚀 Starting Neon database export...\n')
  console.log(`Export directory: ${EXPORT_DIR}\n`)

  // Create export directory
  fs.mkdirSync(EXPORT_DIR, { recursive: true })

  // Connect to Neon
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
  })

  try {
    // Test connection
    await sql`SELECT 1`
    console.log('✅ Connected to Neon database\n')

    let totalRows = 0

    // Export each table
    const exportCounts = await Promise.all(
      TABLES_TO_EXPORT.map((table) => exportTable(sql, table)),
    )
    totalRows = exportCounts.reduce((a, b) => a + b, 0)

    console.log(`\n✅ Export complete! Total rows: ${totalRows}`)
    console.log(`   Files saved to: ${EXPORT_DIR}`)
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error('❌ Export failed:', error)
  process.exit(1)
})
