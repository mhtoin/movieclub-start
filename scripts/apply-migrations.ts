/**
 * Custom migration runner that applies each migration in its own transaction.
 * Use this when drizzle-kit migrate times out due to a large batch in one transaction.
 *
 * Usage:
 *   DATABASE_URL=<url> tsx scripts/apply-migrations.ts
 */
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, {
  max: 1,
  idle_timeout: 60,
  connect_timeout: 30,
  connection: {
    options: '--tcp-keepalives-interval=10 --tcp-keepalives-idle=60',
  },
})

const DRIZZLE_DIR = join(process.cwd(), 'drizzle')
const JOURNAL_PATH = join(DRIZZLE_DIR, 'meta', '_journal.json')

interface JournalEntry {
  idx: number
  tag: string
  when: number
}

interface Journal {
  entries: JournalEntry[]
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const rows = await sql<{ tag: string }[]>`
    SELECT tag FROM drizzle.__drizzle_migrations ORDER BY created_at
  `
  return new Set(rows.map((r) => r.tag))
}

async function ensureMigrationsTable() {
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `
  // Add tag column if it doesn't exist (older drizzle schema)
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='drizzle' AND table_name='__drizzle_migrations' AND column_name='tag'
      ) THEN
        ALTER TABLE drizzle.__drizzle_migrations ADD COLUMN tag text;
      END IF;
    END $$
  `
}

function hashMigration(filePath: string): string {
  const content = readFileSync(filePath, 'utf-8')
  return createHash('sha256').update(content).digest('hex')
}

function splitStatements(sql: string): string[] {
  // Split on drizzle's statement-breakpoint marker, or fall back to semicolons
  const parts = sql.split(/--> statement-breakpoint/g)
  return parts.map((s) => s.trim()).filter((s) => s.length > 0)
}

async function applyMigration(tag: string, filePath: string) {
  const hash = hashMigration(filePath)
  const content = readFileSync(filePath, 'utf-8')
  const statements = splitStatements(content)

  console.log(`\nApplying migration: ${tag} (${statements.length} statements)`)

  // Run all statements then record the migration — each in the same transaction
  await sql.begin(async (tx) => {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      if (!stmt) continue
      process.stdout.write(`  [${i + 1}/${statements.length}] `)
      try {
        await tx.unsafe(stmt)
        process.stdout.write('✓\n')
      } catch (err: unknown) {
        process.stdout.write('✗\n')
        console.error(`  Statement failed:\n${stmt}\n`)
        throw err
      }
    }

    // Record the migration as applied
    await tx`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at, tag)
      VALUES (${hash}, ${Date.now()}, ${tag})
    `
  })

  console.log(`  ✅ ${tag} applied successfully`)
}

async function main() {
  const journal: Journal = JSON.parse(readFileSync(JOURNAL_PATH, 'utf-8'))

  await ensureMigrationsTable()
  const applied = await getAppliedMigrations()

  console.log(`Applied migrations: ${applied.size}`)
  console.log(`Total migrations in journal: ${journal.entries.length}`)

  const pending = journal.entries.filter((e) => !applied.has(e.tag))
  console.log(`Pending: ${pending.length}`)

  if (pending.length === 0) {
    console.log('\nNothing to apply.')
    await sql.end()
    return
  }

  for (const entry of pending) {
    const filePath = join(DRIZZLE_DIR, `${entry.tag}.sql`)
    try {
      await applyMigration(entry.tag, filePath)
    } catch (err) {
      console.error(`\n❌ Migration ${entry.tag} failed. Aborting.`)
      console.error(err)
      await sql.end()
      process.exit(1)
    }
  }

  console.log('\n✅ All migrations applied.')
  await sql.end()
}

main().catch(async (err) => {
  console.error(err)
  await sql.end()
  process.exit(1)
})
