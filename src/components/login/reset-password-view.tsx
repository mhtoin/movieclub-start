import { useRequestPasswordResetMutation } from '@/lib/react-query/mutations/auth'
import { Form } from '@base-ui/react/form'
import { useState } from 'react'
import { Button } from '../ui/button'
import Field from '../ui/field'

interface ResetPasswordViewProps {
  onSwitchToLogin: () => void
}

export default function ResetPasswordView({
  onSwitchToLogin,
}: ResetPasswordViewProps) {
  const [errors, setErrors] = useState({})
  const [isRequesting, setIsRequesting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const requestPasswordResetMutation = useRequestPasswordResetMutation()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const email = formData.get('email') as string

    setIsRequesting(true)

    requestPasswordResetMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setIsSuccess(true)
          setIsRequesting(false)
        },
        onError: (error) => {
          console.error('Password reset request failed:', error)
          setErrors({ form: error.message })
          setIsRequesting(false)
        },
      },
    )
  }

  if (isSuccess) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col space-y-2 text-center sm:text-left mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            If an account exists with that email, we've sent a password reset
            link.
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
        <fieldset disabled={isRequesting} className="contents">
          <Field
            name="email"
            label="Email"
            type="email"
            required
            placeholder="user@example.com"
          />
        </fieldset>

        {requestPasswordResetMutation.error && (
          <div className="text-sm text-red-600">
            {requestPasswordResetMutation.error.message ||
              'Failed to request password reset'}
          </div>
        )}

        <Button
          disabled={isRequesting}
          type="submit"
          variant={'primary'}
          className="w-full mt-2"
        >
          {isRequesting ? 'Sending...' : 'Send Reset Link'}
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
