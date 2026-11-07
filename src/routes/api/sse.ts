import { createFileRoute } from '@tanstack/react-router'
import postgres from 'postgres'
import { useAppSession, validateSessionToken } from '@/lib/auth/auth'
import { logServerError } from '@/lib/server/logger'

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
      logServerError('sse.listener_start_failed', error, {
        method: 'GET',
        path: '/api/sse',
      })
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

  try {
    await sql.listen('movieclub_changes', (payload) => {
      for (const subscriber of subscribers) {
        try {
          subscriber(payload)
        } catch {
          // Subscriber teardown is handled by its own stream lifecycle.
        }
      }
    })
  } catch (error) {
    // A failed LISTEN attempt must not leave a postgres.js client behind when
    // the next SSE request retries listener startup.
    try {
      await sql.end({ timeout: 1 })
    } catch {
      // Preserve the original connection error for diagnostics/retry.
    }
    throw error
  }
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

        const stream = new ReadableStream(
          {
            start: (controller) => {
              let closed = false
              let heartbeatTimer: ReturnType<typeof setInterval> | null = null

              // Only write when the stream can accept more data. A null or
              // non-positive desiredSize means the stream is closed/errored or
              // its buffer is already full — teardown instead of buffering
              // without bound.
              const enqueue = (payload: string) => {
                if (closed) return
                const { desiredSize } = controller
                if (desiredSize === null || desiredSize <= 0) {
                  teardown()
                  return
                }
                try {
                  controller.enqueue(encoder.encode(payload))
                } catch {
                  teardown()
                }
              }

              const send = (payload: string) => {
                enqueue(`data: ${payload}\n\n`)
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

              heartbeatTimer = setInterval(() => {
                enqueue(': keepalive\n\n')
              }, 30_000)

              subscribers.add(send)
              request.signal.addEventListener('abort', teardown)
              // Adding a listener to an already-aborted signal never fires, so
              // check after registering to tear down streams that are already dead.
              if (request.signal.aborted) {
                teardown()
              }
            },

            cancel: () => {
              teardown()
            },
          },
          // PostgreSQL notifications are size-limited. Keeping only a modest
          // number of pending chunks lets brief bursts drain without allowing
          // an unreachable client to accumulate an unbounded queue.
          { highWaterMark: 16 },
        )

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
          },
        })
      },
    },
  },
})
