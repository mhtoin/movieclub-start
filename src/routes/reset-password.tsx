import { Form } from '@base-ui/react/form'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { Button, buttonVariants } from '@/components/ui/button'
import Field from '@/components/ui/field'
import { useResetPasswordMutation } from '@/lib/react-query/mutations/auth'

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
})

type ResetErrors = Partial<Record<'password' | 'form', string>>

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
  const [errors, setErrors] = useState<ResetErrors>({})
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
          <Link to="/" className={buttonVariants({ variant: 'primary' })}>
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const values = {
      password: (formData.get('password') as string) || '',
    }

    const result = resetPasswordSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: ResetErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string | undefined
        if (key && !fieldErrors[key as keyof ResetErrors]) {
          fieldErrors[key as keyof ResetErrors] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    resetPasswordMutation.mutate(
      { token, password: result.data.password },
      {
        onSuccess: () => {
          setIsSuccess(true)
        },
        onError: (error) => {
          setErrors({ form: error.message })
        },
      },
    )
  }

  const isPending = resetPasswordMutation.isPending

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-2xl font-bold">Password Reset Successful</h1>
          <p className="text-muted-foreground">
            Your password has been successfully reset. You can now sign in with
            your new password.
          </p>
          <Link to="/" className={buttonVariants({ variant: 'primary' })}>
            Go to Login
          </Link>
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
          <fieldset disabled={isPending} className="contents">
            <Field
              name="password"
              label="New Password"
              type="password"
              required
              placeholder="At least 8 characters"
              autoComplete="new-password"
              maxLength={72}
              hint="Must be at least 8 characters"
            />
          </fieldset>

          {errors.form && (
            <div
              className="rounded-md bg-destructive/10 p-3 text-center"
              role="alert"
            >
              <p className="text-sm font-medium text-destructive">
                {errors.form}
              </p>
            </div>
          )}

          <Button
            disabled={isPending}
            type="submit"
            variant="primary"
            className="w-full mt-4"
          >
            {isPending ? 'Resetting...' : 'Reset Password'}
          </Button>
        </Form>
      </div>
    </div>
  )
}
