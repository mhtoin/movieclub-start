import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Required for the Neon serverless driver to work in Node.js (not needed in edge runtimes)
neonConfig.webSocketConstructor = ws

// Pool is reused across requests — Neon's proxy handles PgBouncer-style
// connection pooling on its end, so this stays lean.
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const db = drizzle(pool, { schema })
