import { deleteUser as deleteUserFromDb } from '@/db/queries/user'
import { deleteSessionById, useAppSession } from '@/lib/auth/auth'
import { authMiddleware } from '@/middleware/auth'
import { Toast } from '@base-ui/react/toast'
import { useMutation } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

export const deleteUser = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.user) throw new Error('Unauthorized')

    const userId = context.user.userId

    try {
      // Get session token before deleting user data
      const session = await useAppSession()
      const token = session.data?.sessionToken

      // Delete all user data (this also deletes sessions table record via CASCADE)
      await deleteUserFromDb(userId)

      // Clear the session cookie
      await session.clear()

      // Also delete session from database if token exists
      if (token) {
        const [id] = token.split('.')
        if (id) {
          await deleteSessionById(id)
        }
      }

      // Redirect to home page
      throw redirect({
        to: '/',
      })
    } catch (error) {
      // Re-throw redirect errors
      if (
        error instanceof Response &&
        error.status >= 300 &&
        error.status < 400
      ) {
        throw error
      }

      console.error('Error deleting user:', error)
      throw new Error('Failed to delete account. Please try again later.')
    }
  })

export const useDeleteUserMutation = () => {
  const toastManager = Toast.useToastManager()

  return useMutation({
    mutationFn: async () => {
      await deleteUser()
    },
    onError: (error) => {
      // Don't show error toast for redirects (which are successful navigation)
      if (
        error instanceof Response &&
        error.status >= 300 &&
        error.status < 400
      ) {
        return
      }

      console.error('Error deleting account:', error)
      toastManager.add({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete account. Please try again later.',
        type: 'error',
      })
    },
  })
}
