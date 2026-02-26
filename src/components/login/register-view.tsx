import { useRegisterMutation } from '@/lib/react-query/mutations/auth'
import { Form } from '@base-ui/react/form'
import { useState } from 'react'
import { Button } from '../ui/button'
import Field from '../ui/field'
import OAuthProviders from './oauth-providers'

export default function RegisterView() {
  const [errors, setErrors] = useState({})
  const registerMutation = useRegisterMutation()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    registerMutation.mutate(
      { email, password, name },
      {
        onError: (error) => {
          console.error('Registration failed:', error)
          setErrors({ form: error.message })
        },
      },
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <Form
        className="flex w-full flex-col gap-4"
        errors={errors}
        onClearErrors={setErrors}
        onSubmit={handleSubmit}
      >
        <fieldset disabled={registerMutation.isPending} className="contents">
          <Field
            name="name"
            label="Name"
            type="text"
            required
            placeholder="Your Name"
          />
          <Field
            name="email"
            label="Email"
            type="email"
            required
            defaultValue="user@example.com"
            placeholder="user@example.com"
          />
          <Field
            name="password"
            label="Password"
            type="password"
            required
            placeholder="password"
          />
        </fieldset>

        {registerMutation.error && (
          <div className="text-sm text-red-600">
            {registerMutation.error.message || 'Registration failed'}
          </div>
        )}

        <Button
          disabled={registerMutation.isPending}
          type="submit"
          variant="primary"
          className="w-full"
        >
          {registerMutation.isPending
            ? 'Creating account...'
            : 'Create account'}
        </Button>
      </Form>

      <OAuthProviders />
    </div>
  )
}
