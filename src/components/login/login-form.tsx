import { useState } from 'react'
import LoginView from './login-view'
import RegisterView from './register-view'
import ResetPasswordView from './reset-password-view'
import type { LoginMethod } from '@/lib/auth/last-used-login'

export default function LoginForm({
  lastUsedMethod,
}: {
  lastUsedMethod?: LoginMethod | null
}) {
  const [view, setView] = useState<'login' | 'register' | 'reset-password'>(
    'login',
  )

  return (
    <div className="w-full">
      {view === 'login' ? (
        <LoginView
          lastUsedMethod={lastUsedMethod}
          onSwitch={() => setView('register')}
          onForgotPassword={() => setView('reset-password')}
        />
      ) : view === 'register' ? (
        <RegisterView onSwitch={() => setView('login')} />
      ) : (
        <ResetPasswordView onSwitchToLogin={() => setView('login')} />
      )}
    </div>
  )
}
