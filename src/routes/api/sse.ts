import { useAppSession, validateSessionToken } from '@/lib/auth/auth'
import { createFileRoute } from '@tanstack/react-router'
import postgres from 'postgres'

export const Route = createFileRoute('/api/sse')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await useAppSession()
        const sessionToken = session.data?.sessionToken

        if (!sessionToken) {
          return new Response('Unauthorized', { status: 401 })
        }

        const validSession = await validateSessionToken(sessionToken)
        if (!validSession) {
          return new Response('Unauthorized', { status: 401 })
        }

        const databaseUrl = process.env.DATABASE_URL
        if (!databaseUrl) {
          return new Response('Internal Server Error', { status: 500 })
        }

        const encoder = new TextEncoder()

        const sql = postgres(databaseUrl, {
          max: 1,
          idle_timeout: undefined,
          connect_timeout: 15,
        })

        let heartbeatTimer: ReturnType<typeof setInterval> | null = null

        const stream = new ReadableStream({
          start: async (controller) => {
            heartbeatTimer = setInterval(() => {
              try {
                controller.enqueue(encoder.encode(': keepalive\n\n'))
              } catch {}
            }, 30_000)

            request.signal.addEventListener('abort', async () => {
              if (heartbeatTimer !== null) {
                clearInterval(heartbeatTimer)
                heartbeatTimer = null
              }
              try {
                await sql.end()
              } catch {}
              try {
                controller.close()
              } catch {}
            })

            await sql.listen('movieclub_changes', (payload) => {
              try {
                controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
              } catch {}
            })
          },

          cancel: async () => {
            if (heartbeatTimer !== null) {
              clearInterval(heartbeatTimer)
              heartbeatTimer = null
            }
            try {
              await sql.end()
            } catch {}
          },
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      },
    },
  },
})
