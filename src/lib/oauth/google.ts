import { Google, generateCodeVerifier, generateState } from 'arctic'
import type { OAuth2Tokens } from 'arctic'

const baseUrl = process.env.BASE_URL
if (!baseUrl) {
  throw new Error('BASE_URL environment variable is not set')
}

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${baseUrl}/login/google/callback`,
)

export const GOOGLE_SCOPES = ['openid', 'profile', 'email']

export function createGoogleAuthorizationURL() {
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const url = google.createAuthorizationURL(state, codeVerifier, GOOGLE_SCOPES)
  return { state, codeVerifier, url }
}

export async function validateGoogleAuthorizationCode(
  code: string,
  codeVerifier: string,
): Promise<OAuth2Tokens> {
  return google.validateAuthorizationCode(code, codeVerifier)
}

export interface GoogleUser {
  sub: string
  email: string
  email_verified: boolean
  name: string
  given_name: string | null
  family_name: string | null
  picture: string
  locale: string | null
}

export async function getGoogleUser(accessToken: string): Promise<GoogleUser> {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error('Failed to fetch Google user')
  }

  return response.json() as Promise<GoogleUser>
}

export function getGoogleAvatarUrl(user: GoogleUser): string {
  return user.picture
}
