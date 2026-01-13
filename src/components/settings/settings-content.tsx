import {
  Tab,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsRoot,
} from '@/components/ui/tabs'
import { Route } from '@/routes/_authenticated/settings'
import { Route as RootRoute } from '@/routes/__root'
import { Palette, Settings, User } from 'lucide-react'
import { AppearanceSection } from './appearance-section'
import { ProfileSection } from './profile-section'

const tabs = [
  { value: 'profile' as const, label: 'Profile', icon: User },
  { value: 'appearance' as const, label: 'Appearance', icon: Palette },
]

export function SettingsContent() {
  const { user, backgroundPreference } = Route.useRouteContext()
  const { colorScheme } = RootRoute.useLoaderData()

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 lg:px-8 pt-6 pb-6 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
          <TabsRoot defaultValue="profile" variant="underlined">
            <TabsList variant="underlined" className="mb-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Tab key={tab.value} value={tab.value} variant="underlined">
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Tab>
                )
              })}
              <TabsIndicator variant="underlined" />
            </TabsList>

            <TabsPanel value="profile" variant="underlined">
              <ProfileSection user={user} />
            </TabsPanel>
            <TabsPanel value="appearance" variant="underlined">
              <AppearanceSection
                initialBackground={backgroundPreference}
                initialColorScheme={colorScheme}
              />
            </TabsPanel>
          </TabsRoot>
        </div>
      </div>
    </div>
  )
}
