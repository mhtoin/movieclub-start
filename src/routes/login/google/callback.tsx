import { createFileRoute } from '@tanstack/react-router'
import { deleteCookie, getCookie } from '@tanstack/react-start/server'
import {
  createAccount,
  createUserFromOAuth,
  getAccountByUserId,
  getUserByEmail,
  getUserByProvider,
  updateAccount,
} from '@/db/queries/user'
import { createSession, useAppSession } from '@/lib/auth/auth'
import {
  getGoogleAvatarUrl,
  getGoogleUser,
  validateGoogleAuthorizationCode,
} from '@/lib/oauth/google'
import { setLastUsedLoginMethod } from '@/lib/auth/last-used-login'

const GOOGLE_OAUTH_STATE_COOKIE = 'google_oauth_state'
const GOOGLE_OAUTH_CODE_VERIFIER_COOKIE = 'google_oauth_code_verifier'

export const Route = createFileRoute('/login/google/callback')({
  server: {
    handlers: {
      GET: async (ctx) => {
        const url = new URL(ctx.request.url)
        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')
        const storedState = getCookie(GOOGLE_OAUTH_STATE_COOKIE) ?? null
        const storedCodeVerifier =
          getCookie(GOOGLE_OAUTH_CODE_VERIFIER_COOKIE) ?? null

        if (
          code === null ||
          state === null ||
          storedState === null ||
          storedCodeVerifier === null
        ) {
          return new Response('Missing parameters', { status: 400 })
        }

        if (state !== storedState) {
          return new Response('Invalid state', { status: 400 })
        }

        deleteCookie(GOOGLE_OAUTH_STATE_COOKIE)
        deleteCookie(GOOGLE_OAUTH_CODE_VERIFIER_COOKIE)

        let tokens
        try {
          tokens = await validateGoogleAuthorizationCode(
            code,
            storedCodeVerifier,
          )
        } catch (e) {
          console.error('Failed to validate authorization code:', e)
          return new Response('Failed to validate authorization code', {
            status: 400,
          })
        }

        const googleUser = await getGoogleUser(tokens.accessToken())

        let user = await getUserByProvider('google', googleUser.sub)

        if (!user) {
          const existingUser = await getUserByEmail(googleUser.email)
          if (existingUser) {
            user = existingUser
          } else {
            user = await createUserFromOAuth({
              email: googleUser.email,
              name: googleUser.name,
              image: getGoogleAvatarUrl(googleUser),
            })
          }
        }

        if (!user) {
          return new Response('Failed to create or find user', { status: 500 })
        }

        const existingAccount = await getAccountByUserId(user.id, 'google')

        if (existingAccount) {
          await updateAccount(user.id, 'google', {
            accessToken: tokens.accessToken(),
            refreshToken: tokens.hasRefreshToken()
              ? tokens.refreshToken()
              : undefined,
            expiresAt: tokens.accessTokenExpiresAt()
              ? Math.floor(tokens.accessTokenExpiresAt().getTime() / 1000)
              : undefined,
            scope: tokens.hasScopes() ? tokens.scopes().join(' ') : undefined,
            tokenType: tokens.tokenType(),
          })
        } else {
          await createAccount({
            userId: user.id,
            provider: 'google',
            providerAccountId: googleUser.sub,
            accessToken: tokens.accessToken(),
            refreshToken: tokens.hasRefreshToken()
              ? tokens.refreshToken()
              : undefined,
            expiresAt: tokens.accessTokenExpiresAt()
              ? Math.floor(tokens.accessTokenExpiresAt().getTime() / 1000)
              : undefined,
            scope: tokens.hasScopes() ? tokens.scopes().join(' ') : undefined,
            tokenType: tokens.tokenType(),
          })
        }

        const session = await createSession(user.id)
        const tanStackSession = await useAppSession()
        await tanStackSession.update({
          userId: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          sessionToken: session.token,
        })

        await setLastUsedLoginMethod({ data: 'google' })

        return new Response(null, {
          status: 302,
          headers: {
            Location: '/home',
          },
        })
      },
    },
  },
})
