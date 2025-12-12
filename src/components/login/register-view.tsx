import { useRegisterMutation } from '@/lib/react-query/mutations/auth'
import { Form } from '@base-ui/react/form'
import { useState } from 'react'
import Field from '../ui/field'

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
    <Form
      className="flex w-full max-w-64 flex-col gap-4 "
      errors={errors}
      onClearErrors={setErrors}
      onSubmit={handleSubmit}
    >
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

      {registerMutation.error && (
        <div className="text-sm text-red-600">
          {registerMutation.error.message || 'Registration failed'}
        </div>
      )}

      <button
        disabled={registerMutation.isPending}
        type="submit"
        className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        {registerMutation.isPending ? 'Creating account...' : 'Submit'}
      </button>
    </Form>
  )
}
