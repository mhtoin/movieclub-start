import { db } from '@/db/db'
import { user as userTable } from '@/db/schema/users'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import * as z from 'zod'
import { getSessionUser, useAppSession } from './auth/auth'

const schemeValidator = z.enum([
  'default',
  'ocean',
  'sunset',
  'forest',
  'rose',
  'mono',
  'teal',
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
  ocean: {
    label: 'Ocean',
    colors: {
      light: 'oklch(0.55 0.15 230)',
      dark: 'oklch(0.65 0.18 220)',
    },
  },
  sunset: {
    label: 'Sunset',
    colors: {
      light: 'oklch(0.65 0.18 30)',
      dark: 'oklch(0.68 0.20 25)',
    },
  },
  forest: {
    label: 'Forest',
    colors: {
      light: 'oklch(0.55 0.14 145)',
      dark: 'oklch(0.62 0.16 150)',
    },
  },
  rose: {
    label: 'Rose',
    colors: {
      light: 'oklch(0.60 0.18 340)',
      dark: 'oklch(0.65 0.20 335)',
    },
  },
  mono: {
    label: 'Mono',
    colors: {
      light: 'oklch(0.45 0 0)',
      dark: 'oklch(0.70 0 0)',
    },
  },
  teal: {
    label: 'Teal',
    colors: {
      light: 'oklch(0.62 0.08 220)',
      dark: 'oklch(0.65 0.08 220)',
    },
  },
} as const satisfies Record<
  ColorScheme,
  { label: string; colors: { light: string; dark: string } }
>

export const getSchemeServerFn = createServerFn().handler(async () => {
  const cookieScheme = (getCookie('color-scheme') || 'default') as ColorScheme

  try {
    const session = await useAppSession()
    if (session?.data?.sessionToken) {
      const user = await getSessionUser(session.data.sessionToken)
      if (
        user &&
        user.colorScheme &&
        schemeValidator.safeParse(user.colorScheme).success
      ) {
        if (user.colorScheme !== cookieScheme) {
          setCookie('color-scheme', user.colorScheme)
        }
        return user.colorScheme as ColorScheme
      }
    }
    return schemeValidator.parse(cookieScheme)
  } catch {
    return 'default'
  }
})

export const setSchemeServerFn = createServerFn({ method: 'POST' })
  .inputValidator(schemeValidator)
  .handler(async ({ data }) => {
    setCookie('color-scheme', data)

    try {
      const session = await useAppSession()
      if (session?.data?.sessionToken) {
        const user = await getSessionUser(session.data.sessionToken)
        if (user) {
          await db
            .update(userTable)
            .set({ colorScheme: data })
            .where(eq(userTable.id, user.userId))
        }
      }
    } catch {
      // Ignore errors
    }

    return { success: true }
  })
