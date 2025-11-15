import { createUser, getUserByEmail } from '@/db/queries/user'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import bcrypt from 'bcryptjs'
import { createSession, useAppSession } from './auth'

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { email: string; password: string; name: string }) => data,
  )
  .handler(async ({ data }) => {
    const existingUser = await getUserByEmail(data.email)
    if (existingUser) {
      return { error: 'User already exists' }
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
      return { error: 'Invalid email or password' }
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password)
    if (!passwordMatch) {
      return { error: 'Invalid email or password' }
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
