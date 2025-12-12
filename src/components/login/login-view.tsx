import { useLoginMutation } from '@/lib/react-query/mutations/auth'
import { Form } from '@base-ui/react/form'
import { useState } from 'react'
import { Button } from '../ui/button'
import Field from '../ui/field'

export default function LoginView() {
  const [errors, setErrors] = useState({})
  const loginMutation = useLoginMutation()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    loginMutation.mutate(
      { email, password },
      {
        onError: (error) => {
          console.error('Login failed:', error)
          setErrors({ form: error.message })
        },
      },
    )
  }

  return (
    <Form
      className="flex w-full max-w-64 flex-col gap-4 "
      errors={errors}
      onClearErrors={setErrors}
      onSubmit={handleSubmit}
    >
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

      {loginMutation.error && (
        <div className="text-sm text-red-600">
          {loginMutation.error.message || 'Login failed'}
        </div>
      )}

      <Button
        disabled={loginMutation.isPending}
        type="submit"
        variant={'primary'}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Submit'}
      </Button>
    </Form>
  )
}
