import { Form } from '@base-ui/react/form'
import { useState } from 'react'
import { z } from 'zod'
import { Button } from '../ui/button'
import Field from '../ui/field'
import { useRequestPasswordResetMutation } from '@/lib/react-query/mutations/auth'

const requestResetSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
})

type ResetFormErrors = Partial<Record<'email' | 'form', string>>

interface ResetPasswordViewProps {
  onSwitchToLogin: () => void
}

export default function ResetPasswordView({
  onSwitchToLogin,
}: ResetPasswordViewProps) {
  const [errors, setErrors] = useState<ResetFormErrors>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const requestPasswordResetMutation = useRequestPasswordResetMutation()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const values = {
      email: (formData.get('email') as string) || '',
    }

    const result = requestResetSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: ResetFormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string | undefined
        if (key && !fieldErrors[key as keyof ResetFormErrors]) {
          fieldErrors[key as keyof ResetFormErrors] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    requestPasswordResetMutation.mutate(result.data, {
      onSuccess: () => {
        setIsSuccess(true)
      },
      onError: (error) => {
        setErrors({ form: error.message })
      },
    })
  }

  const isPending = requestPasswordResetMutation.isPending

  if (isSuccess) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col space-y-2 text-center sm:text-left mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            If an account exists with that email, we&apos;ve sent a password
            reset link.
          </p>
        </div>
        <Button
          onClick={onSwitchToLogin}
          variant={'primary'}
          className="w-full mt-2"
        >
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col space-y-2 text-center sm:text-left mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a password reset link.
        </p>
      </div>

      <Form
        className="flex w-full flex-col gap-4"
        errors={errors}
        onSubmit={handleSubmit}
      >
        <fieldset disabled={isPending} className="contents">
          <Field
            name="email"
            label="Email"
            type="email"
            required
            placeholder="user@example.com"
            autoComplete="email"
            maxLength={254}
          />
        </fieldset>

        {errors.form && (
          <div className="rounded-md bg-destructive/10 p-3" role="alert">
            <p className="text-sm font-medium text-destructive">
              {errors.form}
            </p>
          </div>
        )}

        <Button
          disabled={isPending}
          type="submit"
          variant={'primary'}
          className="w-full mt-2"
        >
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </Form>

      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        Remember your password?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="underline underline-offset-4 hover:text-primary font-medium"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
