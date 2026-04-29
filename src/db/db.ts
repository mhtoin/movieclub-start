import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const client = postgres(process.env.DATABASE_URL, {
  max: 20,
  idle_timeout: 30,
  max_lifetime: 3600,
  connect_timeout: 10,
  prepare: false,
})

export const db = drizzle(client, { schema })
