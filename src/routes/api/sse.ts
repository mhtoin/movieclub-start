import { createFileRoute } from '@tanstack/react-router'
import postgres from 'postgres'
import { useAppSession, validateSessionToken } from '@/lib/auth/auth'

// All SSE clients share a single Postgres LISTEN connection that fans
// notifications out to every connected stream. A dedicated connection per
// client wastes a Postgres backend (~5-10 MB each) and leaks it entirely
// when a client disconnects uncleanly (laptop sleep, network drop).
const subscribers = new Set<(payload: string) => void>()

let listenerPromise: Promise<void> | null = null

function ensureListener(): Promise<void> {
  if (!listenerPromise) {
    listenerPromise = startListener().catch((error) => {
      // Allow the next SSE request to retry.
      listenerPromise = null
      throw error
    })
  }
  return listenerPromise
}

async function startListener(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: undefined,
    connect_timeout: 15,
  })

  await sql.listen('movieclub_changes', (payload) => {
    for (const subscriber of subscribers) {
      try {
        subscriber(payload)
      } catch {
        // Subscriber teardown is handled by its own stream lifecycle.
      }
    }
  })
}

export const Route = createFileRoute('/api/sse')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await useAppSession()
        const sessionToken = session.data.sessionToken

        if (!sessionToken) {
          return new Response('Unauthorized', { status: 401 })
        }

        const validSession = await validateSessionToken(sessionToken)
        if (!validSession) {
          return new Response('Unauthorized', { status: 401 })
        }

        try {
          await ensureListener()
        } catch {
          return new Response('Internal Server Error', { status: 500 })
        }

        const encoder = new TextEncoder()
        let teardown = () => {}

        const stream = new ReadableStream({
          start: (controller) => {
            let closed = false
            let heartbeatTimer: ReturnType<typeof setInterval> | null = null

            const send = (payload: string) => {
              if (closed) return
              try {
                controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
              } catch {
                teardown()
              }
            }

            teardown = () => {
              if (closed) return
              closed = true
              if (heartbeatTimer !== null) {
                clearInterval(heartbeatTimer)
                heartbeatTimer = null
              }
              subscribers.delete(send)
              request.signal.removeEventListener('abort', teardown)
              try {
                controller.close()
              } catch {}
            }

            // desiredSize is null once the stream is closed or errored —
            // tear down instead of buffering heartbeats into a dead stream.
            heartbeatTimer = setInterval(() => {
              if (controller.desiredSize === null) {
                teardown()
                return
              }
              try {
                controller.enqueue(encoder.encode(': keepalive\n\n'))
              } catch {
                teardown()
              }
            }, 30_000)

            subscribers.add(send)
            request.signal.addEventListener('abort', teardown)
          },

          cancel: () => {
            teardown()
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
