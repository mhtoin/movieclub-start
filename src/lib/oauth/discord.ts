import { Discord, OAuth2Tokens, generateState } from 'arctic'

const baseUrl = process.env.BASE_URL
if (!baseUrl) {
  throw new Error('BASE_URL environment variable is not set')
}

export const discord = new Discord(
  process.env.DISCORD_CLIENT_ID!,
  process.env.DISCORD_CLIENT_SECRET!,
  `${baseUrl}/login/discord/callback`,
)

export const DISCORD_SCOPES = ['identify', 'email']

export function createDiscordAuthorizationURL() {
  const state = generateState()
  const url = discord.createAuthorizationURL(state, null, DISCORD_SCOPES)
  return { state, url }
}

export async function validateDiscordAuthorizationCode(
  code: string,
): Promise<OAuth2Tokens> {
  return discord.validateAuthorizationCode(code, null)
}

export interface DiscordUser {
  id: string
  username: string
  global_name: string | null
  email: string | null
  avatar: string | null
}

export async function getDiscordUser(
  accessToken: string,
): Promise<DiscordUser> {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Discord user')
  }

  return response.json() as Promise<DiscordUser>
}

export function getDiscordAvatarUrl(user: DiscordUser): string {
  if (!user.avatar) {
    return 'https://cdn.discordapp.com/embed/avatars/0.png'
  }
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
}
