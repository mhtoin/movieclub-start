import { createFileRoute } from '@tanstack/react-router'
import { setCookie } from '@tanstack/react-start/server'
import { createDiscordAuthorizationURL } from '@/lib/oauth/discord'

const DISCORD_OAUTH_STATE_COOKIE = 'discord_oauth_state'

export const Route = createFileRoute('/login/discord')({
  server: {
    handlers: {
      GET: () => {
        let authorization: ReturnType<typeof createDiscordAuthorizationURL>

        try {
          authorization = createDiscordAuthorizationURL()
        } catch (error) {
          console.error('Failed to start Discord login:', error)
          return new Response(
            'Discord login is not configured on this server.',
            {
              status: 503,
            },
          )
        }
        const { state, url } = authorization

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
