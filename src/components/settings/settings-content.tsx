import { AppearanceSection } from './appearance-section'
import { ProfileSection } from './profile-section'
import {
  Tab,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsRoot,
} from '@/components/ui/tabs'
import { Route as RootRoute } from '@/routes/__root'
import { Route } from '@/routes/_authenticated/settings'

export function SettingsContent() {
  const { user, backgroundPreference } = Route.useRouteContext()
  const { colorScheme } = RootRoute.useLoaderData()

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 lg:px-8 pt-8 pb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-8">
          <TabsRoot defaultValue="profile" variant="underlined">
            <TabsList variant="underlined" className="mb-8">
              <Tab value="profile" variant="underlined">
                Profile
              </Tab>
              <Tab value="appearance" variant="underlined">
                Appearance
              </Tab>
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
