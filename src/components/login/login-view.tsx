import { Form } from '@base-ui/react/form'
import { useState } from 'react'
import { z } from 'zod'
import { Button } from '../ui/button'
import Field from '../ui/field'
import OAuthProviders from './oauth-providers'
import type { LoginMethod } from '@/lib/auth/last-used-login'
import { useLoginMutation } from '@/lib/react-query/mutations/auth'

const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormErrors = Partial<
  Record<keyof z.infer<typeof loginFormSchema> | 'form', string>
>

interface LoginViewProps {
  lastUsedMethod?: LoginMethod | null
  onSwitch: () => void
  onForgotPassword: () => void
}

export default function LoginView({
  lastUsedMethod,
  onSwitch,
  onForgotPassword,
}: LoginViewProps) {
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const loginMutation = useLoginMutation()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const values = {
      email: (formData.get('email') as string) || '',
      password: (formData.get('password') as string) || '',
    }

    const result = loginFormSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: LoginFormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string | undefined
        if (key && !fieldErrors[key as keyof LoginFormErrors]) {
          fieldErrors[key as keyof LoginFormErrors] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    loginMutation.mutate(result.data, {
      onError: (error) => {
        setErrors({ form: error.message })
      },
    })
  }

  const isPending = loginMutation.isPending

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
          <Field
            name="password"
            label="Password"
            type="password"
            required
            placeholder="Enter your password"
            autoComplete="current-password"
            maxLength={72}
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
          className="w-full mt-2 relative"
        >
          {isPending ? 'Signing in...' : 'Sign In'}
          {lastUsedMethod === 'password' && !isPending && (
            <span className="absolute right-4 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-secondary backdrop-blur-sm border border-border/30 text-secondary-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Last used
            </span>
          )}
        </Button>
      </Form>

      <OAuthProviders lastUsedMethod={lastUsedMethod} />

      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        Don&apos;t have an account?{' '}
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
