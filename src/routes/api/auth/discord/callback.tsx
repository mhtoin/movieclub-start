import { discordCallbackFn } from '@/lib/auth/auth-actions'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/api/auth/discord/callback')({
  component: DiscordCallback,
})

function DiscordCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      discordCallbackFn({ code }).catch((error) => {
        console.error('Discord OAuth callback error:', error)
        window.location.href = '/?error=oauth_failed'
      })
    } else {
      const error = params.get('error')
      window.location.href = `/?error=${error || 'no_code'}`
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
