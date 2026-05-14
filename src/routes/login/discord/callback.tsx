import { createFileRoute } from '@tanstack/react-router'
import { deleteCookie, getCookie } from '@tanstack/react-start/server'
import {
  createAccount,
  createUserFromOAuth,
  getAccountByUserId,
  getUserByProvider,
  updateAccount,
} from '@/db/queries/user'
import { createSession, useAppSession } from '@/lib/auth/auth'
import {
  getDiscordAvatarUrl,
  getDiscordUser,
  validateDiscordAuthorizationCode,
} from '@/lib/oauth/discord'
import { setLastUsedLoginMethod } from '@/lib/auth/last-used-login'

const DISCORD_OAUTH_STATE_COOKIE = 'discord_oauth_state'

export const Route = createFileRoute('/login/discord/callback')({
  server: {
    handlers: {
      GET: async (ctx) => {
        const url = new URL(ctx.request.url)
        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')
        const storedState = getCookie(DISCORD_OAUTH_STATE_COOKIE) ?? null

        if (code === null || state === null || storedState === null) {
          return new Response('Missing parameters', { status: 400 })
        }

        if (state !== storedState) {
          return new Response('Invalid state', { status: 400 })
        }

        deleteCookie(DISCORD_OAUTH_STATE_COOKIE)

        let tokens
        try {
          tokens = await validateDiscordAuthorizationCode(code)
        } catch (e) {
          console.error('Failed to validate authorization code:', e)
          return new Response('Failed to validate authorization code', {
            status: 400,
          })
        }

        const discordUser = await getDiscordUser(tokens.accessToken())

        let user = await getUserByProvider('discord', discordUser.id)

        if (!user) {
          user = await createUserFromOAuth({
            email: discordUser.email ?? `${discordUser.id}@discord.local`,
            name: discordUser.global_name ?? discordUser.username,
            image: getDiscordAvatarUrl(discordUser),
          })
        }

        const existingAccount = await getAccountByUserId(user.id, 'discord')

        if (existingAccount) {
          await updateAccount(user.id, 'discord', {
            accessToken: tokens.accessToken(),
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            refreshToken: tokens.refreshToken() ?? undefined,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            expiresAt: tokens.accessTokenExpiresAt()
              ? Math.floor(tokens.accessTokenExpiresAt().getTime() / 1000)
              : undefined,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            scope: tokens.scopes()?.join(' ') ?? undefined,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            tokenType: tokens.tokenType() ?? undefined,
          })
        } else {
          await createAccount({
            userId: user.id,
            provider: 'discord',
            providerAccountId: discordUser.id,
            accessToken: tokens.accessToken(),
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            refreshToken: tokens.refreshToken() ?? undefined,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            expiresAt: tokens.accessTokenExpiresAt()
              ? Math.floor(tokens.accessTokenExpiresAt().getTime() / 1000)
              : undefined,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            scope: tokens.scopes()?.join(' ') ?? undefined,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            tokenType: tokens.tokenType() ?? undefined,
          })
        }

        const [session, tanStackSession] = await Promise.all([
          createSession(user.id),
          useAppSession(),
        ])
        await tanStackSession.update({
          userId: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          sessionToken: session.token,
        })

        await setLastUsedLoginMethod({ data: 'discord' })

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
