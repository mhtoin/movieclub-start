import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import * as z from 'zod'

export const backgroundValidator = z.enum([
  'none',
  'minimal',
  'shapes',
  'aurora',
  'backdropVeil',
])

export type BackgroundPreference = z.infer<typeof backgroundValidator>

export const getBackgroundServerFn = createServerFn().handler(async () => {
  const cookieBackground = getCookie('background-style') || 'backdropVeil'

  try {
    return backgroundValidator.parse(cookieBackground)
  } catch {
    return 'backdropVeil' as BackgroundPreference
  }
})

export const setBackgroundServerFn = createServerFn({ method: 'POST' })
  .inputValidator(backgroundValidator)
  .handler(async ({ data }) => {
    setCookie('background-style', data, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return { success: true }
  })
