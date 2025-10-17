import { Form } from '@base-ui-components/react/form'
import { useState } from 'react'
import Field from '../ui/field'

export default function LoginView() {
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  return (
    <Form
      className="flex w-full max-w-64 flex-col gap-4 "
      errors={errors}
      onClearErrors={setErrors}
    >
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

      <button
        disabled={loading}
        type="submit"
        className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        Submit
      </button>
    </Form>
  )
}
