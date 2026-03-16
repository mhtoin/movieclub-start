#!/usr/bin/env node
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.production or .env
const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '.env.production') })
config({ path: join(__dirname, '.env') })

// Start the server
import('./.output/server/index.mjs')
