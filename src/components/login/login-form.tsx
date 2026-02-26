import { Tab, TabsList, TabsPanel, TabsRoot } from '../ui/tabs'
import LoginView from './login-view'
import RegisterView from './register-view'

export default function LoginForm() {
  return (
    <TabsRoot defaultValue="login" className="w-full">
      <TabsList variant={'underlined'} className="w-full">
        <Tab value="login" variant={'underlined'} className="flex-1">
          Login
        </Tab>
        <Tab value="register" variant={'underlined'} className="flex-1">
          Register
        </Tab>
      </TabsList>
      <TabsPanel value="login" variant={'underlined'}>
        <LoginView />
      </TabsPanel>
      <TabsPanel value="register" variant={'underlined'}>
        <RegisterView />
      </TabsPanel>
    </TabsRoot>
  )
}
