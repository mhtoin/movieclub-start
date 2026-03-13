import { createFileRoute } from '@tanstack/react-router'
import { setCookie } from '@tanstack/react-start/server'
import { createDiscordAuthorizationURL } from '@/lib/oauth/discord'

const DISCORD_OAUTH_STATE_COOKIE = 'discord_oauth_state'

export const Route = createFileRoute('/login/discord')({
  server: {
    handlers: {
      GET: async () => {
        const { state, url } = createDiscordAuthorizationURL()

        setCookie(DISCORD_OAUTH_STATE_COOKIE, state, {
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
