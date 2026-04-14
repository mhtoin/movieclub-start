import { Form } from '@base-ui/react/form'
import { useState } from 'react'
import { z } from 'zod'
import { Button } from '../ui/button'
import Field from '../ui/field'
import OAuthProviders from './oauth-providers'
import { useRegisterMutation } from '@/lib/react-query/mutations/auth'

const registerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
})

type RegisterFormErrors = Partial<
  Record<keyof z.infer<typeof registerFormSchema> | 'form', string>
>

interface RegisterViewProps {
  onSwitch: () => void
}

export default function RegisterView({ onSwitch }: RegisterViewProps) {
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const registerMutation = useRegisterMutation()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const values = {
      name: (formData.get('name') as string) || '',
      email: (formData.get('email') as string) || '',
      password: (formData.get('password') as string) || '',
    }

    const result = registerFormSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: RegisterFormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string | undefined
        if (key && !fieldErrors[key as keyof RegisterFormErrors]) {
          fieldErrors[key as keyof RegisterFormErrors] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    registerMutation.mutate(result.data, {
      onError: (error) => {
        setErrors({ form: error.message })
      },
    })
  }

  const isPending = registerMutation.isPending

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col space-y-2 text-center sm:text-left mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account.
        </p>
      </div>

      <Form
        className="flex w-full flex-col gap-4"
        errors={errors}
        onSubmit={handleSubmit}
      >
        <fieldset disabled={isPending} className="contents">
          <Field
            name="name"
            label="Name"
            type="text"
            required
            placeholder="Your Name"
            autoComplete="name"
            maxLength={100}
          />
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
            placeholder="At least 8 characters"
            autoComplete="new-password"
            maxLength={72}
            hint="Must be at least 8 characters"
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
          variant="primary"
          className="w-full mt-2"
        >
          {isPending ? 'Creating account...' : 'Create account'}
        </Button>
      </Form>

      <OAuthProviders />

      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="underline underline-offset-4 hover:text-primary font-medium"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
