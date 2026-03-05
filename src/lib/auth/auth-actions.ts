import {
  createPasswordResetToken,
  createUser,
  deletePasswordResetToken,
  getPasswordResetToken,
  getUserByEmail,
  getUserById,
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
