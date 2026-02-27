import { useLoginMutation } from '@/lib/react-query/mutations/auth'
import { Form } from '@base-ui/react/form'
import { useState } from 'react'
import { Button } from '../ui/button'
import Field from '../ui/field'
import OAuthProviders from './oauth-providers'

interface LoginViewProps {
  onSwitch: () => void
  onForgotPassword: () => void
}

export default function LoginView({
  onSwitch,
  onForgotPassword,
}: LoginViewProps) {
  const [errors, setErrors] = useState({})
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const loginMutation = useLoginMutation()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    setIsLoggingIn(true)

    console.log('Attempting login with:', { email, password })

    loginMutation.mutate(
      { email, password },
      {
        onError: (error) => {
          console.error('Login failed:', error)
          setErrors({ form: error.message })
          setIsLoggingIn(false)
        },
      },
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col space-y-2 text-center sm:text-left mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to sign in to your account.
        </p>
      </div>

      <Form
        className="flex w-full flex-col gap-4"
        errors={errors}
        onSubmit={handleSubmit}
      >
        <fieldset disabled={isLoggingIn} className="contents">
          <Field
            name="email"
            label="Email"
            type="email"
            required
            placeholder="user@example.com"
          />
          <Field
            name="password"
            label="Password"
            type="password"
            required
            placeholder="password"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
            >
              Forgot password?
            </button>
          </div>
        </fieldset>

        {loginMutation.error && (
          <div className="text-sm text-red-600">
            {loginMutation.error.message || 'Login failed'}
          </div>
        )}

        <Button
          disabled={isLoggingIn}
          type="submit"
          variant={'primary'}
          className="w-full mt-2"
        >
          {isLoggingIn ? 'Logging in...' : 'Sign In'}
        </Button>
      </Form>

      <OAuthProviders />

      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="underline underline-offset-4 hover:text-primary font-medium"
        >
          Sign up
        </button>
      </p>
    </div>
  )
}
