import { loginFn, registerFn } from '@/lib/auth/auth-actions'
import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

// Types for mutation inputs
export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  password: string
  name: string
}

// Error response type from server functions
type AuthErrorResponse = {
  error: string
}

// Custom hooks for mutations
export function useLoginMutation(): UseMutationResult<
  void | AuthErrorResponse,
  Error,
  LoginInput
> {
  const router = useRouter()

  return useMutation({
    mutationFn: async (variables: LoginInput) => {
      try {
        return await loginFn({ data: variables })
      } catch (error) {
        // For now, a bit of a hack to avoid treating redirects as errors
        if (
          error instanceof Response &&
          error.status >= 300 &&
          error.status < 400
        ) {
          return
        }
        throw error
      }
    },
    onSuccess: () => {
      // Invalidate router cache after successful login
      router.invalidate()
    },
  })
}

export function useRegisterMutation(): UseMutationResult<
  void | AuthErrorResponse,
  Error,
  RegisterInput
> {
  const router = useRouter()

  return useMutation({
    mutationFn: async (variables: RegisterInput) => {
      try {
        return await registerFn({ data: variables })
      } catch (error) {
        // For now, a bit of a hack to avoid treating redirects as errors
        if (
          error instanceof Response &&
          error.status >= 300 &&
          error.status < 400
        ) {
          return
        }
        throw error
      }
    },
    onSuccess: () => {
      // Invalidate router cache after successful registration
      router.invalidate()
    },
  })
}
