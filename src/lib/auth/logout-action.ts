import { createServerFn } from '@tanstack/react-start'
import { useAppSession } from './auth'

export const logoutFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const session = await useAppSession()
    await session.clear()
    return { success: true }
  }
)
