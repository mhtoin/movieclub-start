import {
  createOAuthUser,
  createPasswordResetToken,
  createUser,
  deletePasswordResetToken,
  getPasswordResetToken,
  getUserByEmail,
  getUserById,
  getUserByProvider,
  updateUserPassword,
} from '@/db/queries/user'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import bcrypt from 'bcryptjs'
import { sendPasswordResetEmail } from '../email'
import { createSession, useAppSession } from './auth'

export const requestPasswordResetFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const user = await getUserByEmail(data.email)
    if (!user) {
      // We don't want to reveal if a user exists or not, so we just return success
      return { success: true }
    }

    // Generate a secure token
    const token = crypto.randomUUID()
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60)

    await createPasswordResetToken(user.id, token, expiresAt)

    // In a real app, you'd get the base URL from an environment variable or request headers
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001'
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    await sendPasswordResetEmail(user.email, resetLink)

    return { success: true }
  })

export const resetPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; password: string }) => data)
  .handler(async ({ data }) => {
    const resetToken = await getPasswordResetToken(data.token)

    if (!resetToken) {
      throw new Error('Invalid or expired password reset token')
    }

    if (new Date() > resetToken.expiresAt) {
      await deletePasswordResetToken(resetToken.id)
      throw new Error('Password reset token has expired')
    }

    const user = await getUserById(resetToken.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)
    await updateUserPassword(user.email, hashedPassword)
    await deletePasswordResetToken(resetToken.id)

    return { success: true }
  })

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { email: string; password: string; name: string }) => data,
  )
  .handler(async ({ data }) => {
    const existingUser = await getUserByEmail(data.email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await createUser({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    })

    const session = await createSession(user.id)
    const tanStackSession = await useAppSession()
    await tanStackSession.update({
      userId: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      sessionToken: session.token,
    })

    throw redirect({ to: '/home' })
  })
export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const user = await getUserByEmail(data.email)
    if (!user || !user.password) {
      console.error(
        'Login failed: User not found or missing password for',
        data.email,
      )
      throw new Error('Invalid email or password')
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password)
    if (!passwordMatch) {
      console.error('Login failed: Incorrect password for', data.email)
      throw new Error('Invalid email or password')
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

    throw redirect({ to: '/home' })
  })

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI
const DISCORD_AUTH_URL = 'https://discord.com/api/oauth2/authorize'
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token'
const DISCORD_USER_URL = 'https://discord.com/api/users/@me'

interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email: string | null
  verified: boolean
}

interface DiscordTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

export const discordRedirectFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
      throw new Error('Discord OAuth is not configured')
    }

    const scopes = ['identify', 'email', 'guilds'].join(' ')
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: scopes,
    })

    return `${DISCORD_AUTH_URL}?${params.toString()}`
  },
)

export const discordCallbackFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }: { data: { code: string } }) => {
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
      throw new Error('Discord OAuth is not configured')
    }

    const tokenParams = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: data.code,
      redirect_uri: DISCORD_REDIRECT_URI,
    })

    const tokenResponse = await fetch(DISCORD_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    })

    if (!tokenResponse.ok) {
      console.error(
        'Discord token exchange failed:',
        await tokenResponse.text(),
      )
      throw new Error('Failed to exchange code for token')
    }

    const tokenData: DiscordTokenResponse = await tokenResponse.json()

    const userResponse = await fetch(DISCORD_USER_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Discord user fetch failed:', await userResponse.text())
      throw new Error('Failed to fetch user from Discord')
    }

    const discordUser: DiscordUser = await userResponse.json()

    if (!discordUser.email) {
      throw new Error('Discord email is required for login')
    }

    const provider = 'discord'
    const providerAccountId = discordUser.id
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : ''
    const name = `${discordUser.username}#${discordUser.discriminator}`

    let user = await getUserByProvider(provider, providerAccountId)

    if (!user) {
      user = await createOAuthUser({
        email: discordUser.email,
        name: name,
        image: avatarUrl,
        provider: provider,
        providerAccountId: providerAccountId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Math.floor(Date.now() / 1000 + tokenData.expires_in),
      })
    }

    if (!user) {
      throw new Error('Failed to create or find user')
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

    throw redirect({ to: '/home' })
  })
