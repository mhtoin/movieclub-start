import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendPasswordResetEmail } from '../email'
import { createSession, useAppSession } from './auth'
import { setLastUsedLoginMethod } from './last-used-login'
import {
  createPasswordResetToken,
  createUser,
  deletePasswordResetToken,
  getPasswordResetToken,
  getUserByEmail,
  getUserById,
  updateUserPassword,
} from '@/db/queries/user'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(72, 'Password must be 72 characters or fewer')

const emailSchema = z.string().trim().email('Please enter a valid email')

const requestPasswordResetSchema = z.object({
  email: emailSchema,
})

const resetPasswordSchema = z.object({
  token: z.string().uuid('Invalid password reset token'),
  password: passwordSchema,
})

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(1, 'Name is required').max(100),
})

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

const authRateLimitStore = new Map<string, { count: number; resetAt: number }>()

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function cleanupExpiredRateLimits(now: number) {
  for (const [key, entry] of authRateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      authRateLimitStore.delete(key)
    }
  }
}

function enforceRateLimit(
  key: string,
  { maxAttempts, windowMs }: { maxAttempts: number; windowMs: number },
) {
  const now = Date.now()
  cleanupExpiredRateLimits(now)

  const existing = authRateLimitStore.get(key)

  if (!existing || existing.resetAt <= now) {
    authRateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (existing.count >= maxAttempts) {
    throw new Error('Too many attempts. Please try again later.')
  }

  existing.count += 1
  authRateLimitStore.set(key, existing)
}

function clearRateLimit(key: string) {
  authRateLimitStore.delete(key)
}

export const requestPasswordResetFn = createServerFn({ method: 'POST' })
  .inputValidator(requestPasswordResetSchema)
  .handler(async ({ data }) => {
    const email = normalizeEmail(data.email)
    enforceRateLimit(`password-reset:${email}`, {
      maxAttempts: 3,
      windowMs: 15 * 60 * 1000,
    })

    const user = await getUserByEmail(email)
    if (!user) {
      return { success: true }
    }

    const baseUrl = process.env.BASE_URL
    if (!baseUrl) {
      throw new Error('BASE_URL is not configured on the server')
    }

    // Generate a secure token
    const token = crypto.randomUUID()
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60)
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    // Attempt to send the email BEFORE writing the token to the database.
    // This way, if the send fails, there is nothing to clean up.
    const emailResult = await sendPasswordResetEmail(user.email, resetLink)
    if (!emailResult.success) {
      throw new Error(
        'Failed to send password reset email. Please try again later.',
      )
    }

    await createPasswordResetToken(user.id, token, expiresAt)

    return { success: true }
  })

export const resetPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(resetPasswordSchema)
  .handler(async ({ data }) => {
    enforceRateLimit(`reset-password:${data.token}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
    })

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
    clearRateLimit(`reset-password:${data.token}`)

    return { success: true }
  })

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(registerSchema)
  .handler(async ({ data }) => {
    const email = normalizeEmail(data.email)
    enforceRateLimit(`register:${email}`, {
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000,
    })

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await createUser({
      email,
      password: hashedPassword,
      name: data.name.trim(),
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

    clearRateLimit(`register:${email}`)

    await setLastUsedLoginMethod({ data: 'password' })

    throw redirect({ to: '/home' })
  })
export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const email = normalizeEmail(data.email)
    enforceRateLimit(`login:${email}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
    })

    const user = await getUserByEmail(email)
    if (!user || !user.password) {
      console.error(
        'Login failed: User not found or missing password for',
        email,
      )
      throw new Error('Invalid email or password')
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password)
    if (!passwordMatch) {
      console.error('Login failed: Incorrect password for', email)
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

    clearRateLimit(`login:${email}`)

    await setLastUsedLoginMethod({ data: 'password' })

    throw redirect({ to: '/home' })
  })
