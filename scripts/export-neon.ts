/**
 * Export script to download data from Neon PostgreSQL database to CSV files
 * Run with: pnpm db:export
 */
import { stringify } from 'csv-stringify/sync'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
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

async function exportTable(
  sql: postgres.Sql,
  tableName: string,
): Promise<number> {
  console.log(`  Exporting "${tableName}"...`)

  try {
    // Query all rows from the table
    const rows = await sql.unsafe(`SELECT * FROM "${tableName}"`)

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
  if (!process.env.OLD_DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is required (should point to Neon)',
    )
  }

  console.log('🚀 Starting Neon database export...\n')
  console.log(`Export directory: ${EXPORT_DIR}\n`)

  // Create export directory
  fs.mkdirSync(EXPORT_DIR, { recursive: true })

  // Connect to Neon
  const sql = postgres(process.env.OLD_DATABASE_URL, {
    ssl: 'require',
  })

  try {
    // Test connection
    await sql`SELECT 1`
    console.log('✅ Connected to Neon database\n')

    let totalRows = 0

    // Export each table
    for (const table of TABLES_TO_EXPORT) {
      const count = await exportTable(sql, table)
      totalRows += count
    }

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
