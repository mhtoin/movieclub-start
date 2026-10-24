import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'
import { getIronSession } from 'iron-session'
import { eq } from 'drizzle-orm'
import type { SessionOptions } from 'iron-session'
import type { Session, SessionWithToken, UserSession } from '@/types/auth'
import { db } from '@/db/db'
import { getUserById } from '@/db/queries/user'
import { sessionsTable } from '@/db/schema/sessions'

const sessionDurationInDays = 30
const sessionExpiresInSeconds = 60 * 60 * 24 * sessionDurationInDays

// `app-session` was written by Start's old sealed-session helper. Those
// cookies cannot be read by iron-session, so we start fresh under a new name
// and remove the legacy cookie whenever we set or clear a session.
const appSessionCookieName = 'app-session-v2'
const legacyAppSessionCookieName = 'app-session'

function generateSecureRandomString(): string {
  // Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789'

  const bytes = new Uint8Array(15)
  crypto.getRandomValues(bytes)

  let id = ''
  let bitBuffer = 0
  let bitsInBuffer = 0

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < bytes.length; i++) {
    // Add the current byte to our bit buffer
    bitBuffer = (bitBuffer << 8) | bytes[i]
    bitsInBuffer += 8

    // Extract 5-bit chunks while we have enough bits
    while (bitsInBuffer >= 5) {
      // Extract the top 5 bits
      const index = (bitBuffer >> (bitsInBuffer - 5)) & 0x1f // 0x1f = 31 = 2^5 - 1
      id += alphabet[index]
      bitsInBuffer -= 5
    }
  }

  return id
}

export async function createSession(userId: string): Promise<SessionWithToken> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + sessionExpiresInSeconds * 1000)

  const id = generateSecureRandomString()
  const secret = generateSecureRandomString()
  const secretHashBuffer = await hashSecret(secret)
  const secretHash = Buffer.from(secretHashBuffer).toString('hex')

  const token = `${id}.${secret}`

  const session: SessionWithToken = {
    id,
    secretHash,
    createdAt: now,
    expiresAt: expiresAt,
    userId,
    token,
  }

  try {
    await db.insert(sessionsTable).values({
      id: session.id,
      userId: userId,
      secretHash: session.secretHash,
      expiresAt: expiresAt,
      createdAt: now,
    })
  } catch (error) {
    console.error('Database error while creating session:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }

  return session
}

export async function validateSessionToken(
  token: string,
): Promise<Session | null> {
  const [id, secret] = token.split('.')
  if (!id || !secret) {
    return null
  }

  const sessionRecord = await getSession(id)

  if (!sessionRecord) {
    return null
  }

  const tokenSecretHash = await hashSecret(secret)
  const storedSecretHash = Buffer.from(sessionRecord.secretHash, 'hex')
  const validSecret = constantTimeEqual(tokenSecretHash, storedSecretHash)
  if (!validSecret) {
    return null
  }

  return sessionRecord
}

async function getSession(id: string): Promise<Session | null> {
  const now = new Date()

  try {
    const sessionRecord = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, id))
      .limit(1)
      .then((rows) => rows[0] || null)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!sessionRecord) {
      return null
    }

    // Check if the session has expired
    const expiresAt = new Date(sessionRecord.expiresAt)
    if (expiresAt <= now) {
      await deleteSession(id)
      return null
    }
    return sessionRecord
  } catch (error) {
    // Log the error and rethrow with more context
    console.error('Database error while fetching session:', error)
    throw new Error(
      'Failed to connect to the database. Please ensure the database is running.',
      { cause: error },
    )
  }
}

async function deleteSession(id: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, id))
}

async function hashSecret(secret: string): Promise<Uint8Array> {
  const secretBytes = new TextEncoder().encode(secret)
  const hashBuffer = await crypto.subtle.digest('SHA-256', secretBytes)
  return new Uint8Array(hashBuffer)
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false
  }
  let c = 0
  for (let i = 0; i < a.byteLength; i++) {
    c |= a[i] ^ b[i]
  }
  return c === 0
}

// Short-lived cache for getSessionUser to deduplicate auth during SSR.
// During a single page render TanStack Start calls multiple server functions
// (beforeLoad, prefetchQuery×N) which each need to authenticate. Without this
// cache, each call independently hits the DB for session + user lookups.
// A 5-second TTL ensures the cache only helps within a single request cycle
// while staying safe for concurrent requests with different sessions.
const sessionUserCache = new Map<
  string,
  { user: UserSession | null; expiry: number }
>()
const SESSION_CACHE_TTL_MS = 5_000

export async function getSessionUser(
  sessionToken?: string,
): Promise<UserSession | null> {
  if (!sessionToken) {
    return null
  }

  // Check cache first
  const cached = sessionUserCache.get(sessionToken)
  if (cached && cached.expiry > Date.now()) {
    return cached.user
  }

  const session = await validateSessionToken(sessionToken)

  if (!session) {
    sessionUserCache.set(sessionToken, {
      user: null,
      expiry: Date.now() + SESSION_CACHE_TTL_MS,
    })
    return null
  }

  const user = await getUserById(session.userId)

  if (!user) {
    sessionUserCache.set(sessionToken, {
      user: null,
      expiry: Date.now() + SESSION_CACHE_TTL_MS,
    })
    return null
  }

  const userSession: UserSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    colorScheme: user.colorScheme as UserSession['colorScheme'],
    role: user.role,
  }

  sessionUserCache.set(sessionToken, {
    user: userSession,
    expiry: Date.now() + SESSION_CACHE_TTL_MS,
  })

  // Prune stale entries periodically (keep map from growing unbounded)
  if (sessionUserCache.size > 100) {
    const now = Date.now()
    for (const [key, entry] of sessionUserCache) {
      if (entry.expiry <= now) sessionUserCache.delete(key)
    }
  }

  return userSession
}

export async function requireAuthenticatedUser(): Promise<UserSession> {
  const session = await getAppSession()
  const user = await getSessionUser(session.data.sessionToken)

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireCurrentUser(
  targetUserId: string,
): Promise<UserSession> {
  const currentUser = await requireAuthenticatedUser()

  if (currentUser.userId !== targetUserId) {
    throw new Error('Forbidden')
  }

  return currentUser
}

export async function deleteSessionById(id: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, id))
}

type AppSessionData = {
  sessionToken?: string
}

// Callers still pass the full UserSession-shaped object for compatibility,
// but only `sessionToken` is persisted. The database remains the source of
// truth for validating that token.
type AppSessionUpdate = Partial<UserSession> & { sessionToken: string }

export type AppSession = {
  data: Readonly<AppSessionData>
  update: (data: AppSessionUpdate) => Promise<void>
  clear: () => Promise<void>
}

// Shape of the cookie objects iron-session passes to its cookie store adapter.
type AppSessionCookie = {
  name: string
  value: string
  domain?: string
  path?: string
  sameSite?: boolean | 'lax' | 'strict' | 'none'
  secure?: boolean
  httpOnly?: boolean
  maxAge?: number
  priority?: 'low' | 'medium' | 'high'
  expires?: Date | number
}

type AppSessionCookieStore = {
  get: (name: string) => { name: string; value: string } | undefined
  set: {
    (name: string, value: string, options?: Partial<AppSessionCookie>): void
    (options: AppSessionCookie): void
  }
}

function getAppSessionOptions(): SessionOptions {
  const password = process.env.SESSION_PASSWORD
  if (!password) {
    throw new Error('SESSION_PASSWORD environment variable is required')
  }

  return {
    cookieName: appSessionCookieName,
    password,
    ttl: sessionExpiresInSeconds,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionExpiresInSeconds,
      path: '/',
    },
  }
}

function createAppSessionCookieStore(): AppSessionCookieStore {
  return {
    get(name) {
      const value = getCookie(name)
      return value === undefined ? undefined : { name, value }
    },
    set(
      nameOrOptions: string | AppSessionCookie,
      value?: string,
      options?: Partial<AppSessionCookie>,
    ) {
      const cookie =
        typeof nameOrOptions === 'string'
          ? { ...options, name: nameOrOptions, value: value ?? '' }
          : nameOrOptions

      setCookie(cookie.name, cookie.value, {
        domain: cookie.domain,
        expires:
          typeof cookie.expires === 'number'
            ? new Date(cookie.expires)
            : cookie.expires,
        httpOnly: cookie.httpOnly,
        maxAge: cookie.maxAge,
        path: cookie.path,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
        priority: cookie.priority,
      })
    },
  }
}

export async function getAppSession(): Promise<AppSession> {
  const session = await getIronSession<AppSessionData>(
    createAppSessionCookieStore(),
    getAppSessionOptions(),
  )

  const data: AppSessionData = {
    sessionToken: session.sessionToken || undefined,
  }

  // Keep the sealed payload to the single field we trust, even if an older
  // cookie somehow contains additional keys.
  for (const key of Object.keys(session)) {
    if (key !== 'sessionToken') {
      delete (session as Record<string, unknown>)[key]
    }
  }

  return {
    data,
    async update(next) {
      session.sessionToken = next.sessionToken
      data.sessionToken = next.sessionToken
      await session.save()
      deleteCookie(legacyAppSessionCookieName, { path: '/' })
    },
    clear() {
      session.destroy()
      delete data.sessionToken
      deleteCookie(legacyAppSessionCookieName, { path: '/' })
      return Promise.resolve()
    },
  }
}

/**
 * Kept for existing call sites. The old Start session helper exposed this
 * name, but it is a server session accessor rather than a React hook.
 */
export const useAppSession = getAppSession
