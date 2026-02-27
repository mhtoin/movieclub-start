/**
 * scripts/stamp-migrations.ts
 *
 * Marks all drizzle migrations as applied WITHOUT running them.
 * Use this when the database schema already exists but the
 * drizzle.__drizzle_migrations table is empty or incomplete.
 *
 * Run on the server (from repo root, with DATABASE_URL set):
 *   DATABASE_URL=... npx tsx scripts/stamp-migrations.ts
 *   -- or via the app container --
 *   docker compose -f docker-compose.prod.yml exec -T app \
 *     npx tsx scripts/stamp-migrations.ts
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const MIGRATIONS_FOLDER = path.join(process.cwd(), 'drizzle')

interface JournalEntry {
  idx: number
  when: number
  tag: string
}

interface Journal {
  entries: JournalEntry[]
}

const journal: Journal = JSON.parse(
  fs.readFileSync(
    path.join(MIGRATIONS_FOLDER, 'meta', '_journal.json'),
    'utf8',
  ),
)

const sql = postgres(DATABASE_URL)

async function main() {
  // Ensure the drizzle schema and migrations table exist
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id        SERIAL PRIMARY KEY,
      hash      TEXT NOT NULL,
      created_at BIGINT
    )
  `

  for (const entry of journal.entries) {
    const filePath = path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`)
    const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n')
    const hash = crypto.createHash('sha256').update(content).digest('hex')

    const existing =
      await sql`SELECT id FROM drizzle.__drizzle_migrations WHERE hash = ${hash}`

    if (existing.length > 0) {
      console.log(`  already stamped: ${entry.tag}`)
    } else {
      await sql`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES (${hash}, ${entry.when})
      `
      console.log(`  stamped: ${entry.tag}`)
    }
  }

  console.log('\nDone. All migrations are now recorded as applied.')
  await sql.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
