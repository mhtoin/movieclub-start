import { Button } from '@/components/ui/button'
import Field from '@/components/ui/field'
import { useResetPasswordMutation } from '@/lib/react-query/mutations/auth'
import { Form } from '@base-ui/react/form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string | undefined,
    }
  },
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const [errors, setErrors] = useState({})
  const [isResetting, setIsResetting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const resetPasswordMutation = useResetPasswordMutation()

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or missing a token.
          </p>
          <Button variant="primary">
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = formData.get('password') as string

    setIsResetting(true)

    resetPasswordMutation.mutate(
      { token, password },
      {
        onSuccess: () => {
          setIsSuccess(true)
          setIsResetting(false)
        },
        onError: (error) => {
          console.error('Password reset failed:', error)
          setErrors({ form: error.message })
          setIsResetting(false)
        },
      },
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-2xl font-bold">Password Reset Successful</h1>
          <p className="text-muted-foreground">
            Your password has been successfully reset. You can now sign in with
            your new password.
          </p>
          <Button variant="primary">
            <Link to="/">Go to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl border shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your new password below.
          </p>
        </div>

        <Form
          className="flex w-full flex-col gap-4"
          errors={errors}
          onSubmit={handleSubmit}
        >
          <fieldset disabled={isResetting} className="contents">
            <Field
              name="password"
              label="New Password"
              type="password"
              required
              placeholder="Enter new password"
            />
          </fieldset>

          {resetPasswordMutation.error && (
            <div className="text-sm text-red-600 text-center">
              {resetPasswordMutation.error.message || 'Password reset failed'}
            </div>
          )}

          <Button
            disabled={isResetting}
            type="submit"
            variant="primary"
            className="w-full mt-4"
          >
            {isResetting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </Form>
      </div>
    </div>
  )
}
