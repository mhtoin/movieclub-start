import { createFileRoute } from '@tanstack/react-router'
import { setCookie } from '@tanstack/react-start/server'
import { createGoogleAuthorizationURL } from '@/lib/oauth/google'

const GOOGLE_OAUTH_STATE_COOKIE = 'google_oauth_state'
const GOOGLE_OAUTH_CODE_VERIFIER_COOKIE = 'google_oauth_code_verifier'

export const Route = createFileRoute('/login/google')({
  server: {
    handlers: {
      GET: async () => {
        const { state, codeVerifier, url } = createGoogleAuthorizationURL()

        setCookie(GOOGLE_OAUTH_STATE_COOKIE, state, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 60 * 10,
          sameSite: 'lax',
        })

        setCookie(GOOGLE_OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 60 * 10,
          sameSite: 'lax',
        })

        return new Response(null, {
          status: 302,
          headers: {
            Location: url.toString(),
          },
        })
      },
    },
  },
})
