import { Tab, TabsIndicator, TabsList, TabsPanel, TabsRoot } from '../ui/tabs'
import LoginView from './login-view'
import RegisterView from './register-view'

export default function LoginForm() {
  return (
    <TabsRoot defaultValue="login">
      <TabsList variant={'underline'}>
        <Tab value="login" variant={'underline'}>
          Login
        </Tab>
        <Tab value="register" variant={'underline'}>
          Register
        </Tab>
        <TabsIndicator variant={'underline'} />
      </TabsList>
      <TabsPanel value="login">
        <LoginView />
      </TabsPanel>
      <TabsPanel value="register">
        <RegisterView />
      </TabsPanel>
    </TabsRoot>
  )
}
