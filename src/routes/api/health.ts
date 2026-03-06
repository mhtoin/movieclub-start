import { db } from '@/db/db'
import { createFileRoute } from '@tanstack/react-router'
import { sql } from 'drizzle-orm'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        try {
          await db.execute(sql`select 1`)

          return Response.json({
            ok: true,
            timestamp: new Date().toISOString(),
          })
        } catch (error) {
          console.error('Health check failed:', error)

          return Response.json(
            {
              ok: false,
              timestamp: new Date().toISOString(),
            },
            { status: 503 },
          )
        }
      },
    },
  },
})
