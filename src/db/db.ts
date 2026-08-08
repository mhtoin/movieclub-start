import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const client = postgres(process.env.DATABASE_URL, {
  // Small pool: each connection is a backend process on the Postgres
  // service (~5-10 MB RSS). 5 is generous for a single small app instance.
  max: 5,
  idle_timeout: 30,
  max_lifetime: 3600,
  connect_timeout: 10,
  prepare: false,
})

export const db = drizzle(client, { schema })
