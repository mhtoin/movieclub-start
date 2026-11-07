import { createFileRoute } from '@tanstack/react-router'
import { sql } from 'drizzle-orm'
import { db } from '@/db/db'
import { logServerError } from '@/lib/server/logger'

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
          logServerError('health.database_check_failed', error, {
            method: 'GET',
            path: '/api/health',
          })

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
