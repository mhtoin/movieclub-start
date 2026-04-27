import { db } from '@/db/db'
import { user as userTable } from '@/db/schema/users'
import { authMiddleware } from '@/middleware/auth'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import * as z from 'zod'

const schemeValidator = z.enum([
  'default',
  'mono',
  'teal',
  'tokyo',
])
export type ColorScheme = z.infer<typeof schemeValidator>

export const COLOR_SCHEMES = {
  default: {
    label: 'Default',
    colors: {
      light: 'oklch(0.6716 0.1368 48.513)',
      dark: 'oklch(0.7214 0.1337 49.9802)',
    },
  },
  mono: {
    label: 'Mono',
    colors: {
      light: 'oklch(0.35 0.005 30)',
      dark: 'oklch(0.82 0.005 30)',
    },
  },
  teal: {
    label: 'Teal',
    colors: {
      light: 'oklch(0.62 0.08 220)',
      dark: 'oklch(0.65 0.08 220)',
    },
  },
  tokyo: {
    label: 'Tokyo',
    colors: {
      light: 'oklch(0.22 0.015 50)',
      dark: 'oklch(0.88 0.005 50)',
    },
  },
} as const satisfies Record<
  ColorScheme,
  { label: string; colors: { light: string; dark: string } }
>

export const getSchemeServerFn = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const cookieScheme = (getCookie('color-scheme') || 'default') as ColorScheme

    try {
      const user = context.user
      if (
        user?.colorScheme &&
        schemeValidator.safeParse(user.colorScheme).success
      ) {
        if (user.colorScheme !== cookieScheme) {
          setCookie('color-scheme', user.colorScheme)
        }
        return user.colorScheme as ColorScheme
      }
      return schemeValidator.parse(cookieScheme)
    } catch {
      return 'default'
    }
  })

export const getThemeAndSchemeServerFn = createServerFn().handler(async () => {
  // Cookie-only: no DB call needed. The cookie is kept in sync with the DB
  // by setSchemeServerFn whenever the user changes their scheme.
  const theme = (getCookie('theme') || 'light') as 'light' | 'dark'
  const cookieScheme = getCookie('color-scheme') || 'default'
  let colorScheme: ColorScheme = 'default'
  try {
    colorScheme = schemeValidator.parse(cookieScheme)
  } catch {
    colorScheme = 'default'
  }
  return { theme, colorScheme }
})

export const setSchemeServerFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(schemeValidator)
  .handler(async ({ context, data }) => {
    setCookie('color-scheme', data)

    try {
      const user = context.user
      if (user) {
        await db
          .update(userTable)
          .set({ colorScheme: data })
          .where(eq(userTable.id, user.userId))
      }
    } catch {
      // Ignore errors
    }

    return { success: true }
  })
