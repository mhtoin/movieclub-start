import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env.local file
config({ path: '.env.local' });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
