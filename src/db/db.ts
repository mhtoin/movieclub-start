import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless'
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import ws from 'ws'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const databaseUrl = process.env.DATABASE_URL

const isNeon = databaseUrl.includes('neon.tech')

let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>

if (isNeon) {
  neonConfig.webSocketConstructor = ws
  const pool = new Pool({ connectionString: databaseUrl })
  db = drizzleNeon(pool, { schema })
} else {
  const client = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 30,
    max_lifetime: 1800,
    connect_timeout: 15,
  })
  db = drizzlePg(client, { schema })
}

export { db }
