import { useState } from 'react'
import LoginView from './login-view'
import RegisterView from './register-view'

export default function LoginForm() {
  const [view, setView] = useState<'login' | 'register'>('login')

  return (
    <div className="w-full">
      {view === 'login' ? (
        <LoginView onSwitch={() => setView('register')} />
      ) : (
        <RegisterView onSwitch={() => setView('login')} />
      )}
    </div>
  )
}
