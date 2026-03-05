import { createServerFn } from '@tanstack/react-start'
import { deleteSessionById, useAppSession } from './auth'

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession()
  const token = session.data?.sessionToken
  if (token) {
    const [id] = token.split('.')
    if (id) {
      await deleteSessionById(id)
    }
  }
  await session.clear()
  return { success: true }
})
