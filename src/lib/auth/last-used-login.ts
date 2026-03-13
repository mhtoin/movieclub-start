import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

export type LoginMethod = 'password' | 'google' | 'discord'

const loginMethodSchema = z.enum(['password', 'google', 'discord'])

const LAST_USED_LOGIN_COOKIE = 'last-used-login'
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export function getLastUsedLoginMethodFromClient(): LoginMethod | null {
  if (typeof window === 'undefined') return null
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${LAST_USED_LOGIN_COOKIE}=`))
    ?.split('=')[1]
  if (!cookie) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(cookie)) as {
      method: LoginMethod
      timestamp: number
    }
    if (Date.now() - parsed.timestamp > THIRTY_DAYS_MS) {
      return null
    }
    return parsed.method
  } catch {
    return null
  }
}

export const getLastUsedLoginMethod = createServerFn().handler(async () => {
  const cookie = getCookie(LAST_USED_LOGIN_COOKIE)
  if (!cookie) return null

  try {
    const parsed = JSON.parse(cookie) as {
      method: LoginMethod
      timestamp: number
    }
    if (Date.now() - parsed.timestamp > THIRTY_DAYS_MS) {
      return null
    }
    return parsed.method
  } catch {
    return null
  }
})

export const setLastUsedLoginMethod = createServerFn({ method: 'POST' })
  .inputValidator(loginMethodSchema)
  .handler(async ({ data }) => {
    setCookie(
      LAST_USED_LOGIN_COOKIE,
      JSON.stringify({ method: data, timestamp: Date.now() }),
      {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: false,
        sameSite: 'lax',
      },
    )
    return { success: true }
  })
