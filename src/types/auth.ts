import { z } from 'zod'

export const colorSchemeSchema = z.enum(['default', 'mono', 'teal', 'tokyo'])

export type ColorScheme = z.infer<typeof colorSchemeSchema>

export interface Session {
  id: string
  secretHash: string
  createdAt: Date
  expiresAt: Date
  userId: string
}

export interface SessionWithToken extends Session {
  token: string
}

export type UserSession = {
  userId: string
  email: string
  name: string
  image: string
  sessionToken?: string
  colorScheme: ColorScheme
}
