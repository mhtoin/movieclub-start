import { Toast } from '@base-ui-components/react/toast'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { ErrorComponent } from '@/components/error-component'
import { ThemeProvider } from '@/components/theme-provider'
import ToastList from '@/components/ui/toast-list'
import { getSchemeServerFn } from '@/lib/color-scheme'
import { getThemeServerFn } from '@/lib/theme'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  errorComponent: ErrorComponent,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  loader: async () => {
    const [theme, colorScheme] = await Promise.all([
      getThemeServerFn(),
      getSchemeServerFn(),
    ])

    return { theme, colorScheme }
  },
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme, colorScheme } = Route.useLoaderData()

  return (
    <html
      className={`${theme} scheme-${colorScheme}`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>

      <body>
        <ThemeProvider theme={theme}>
          <Toast.Provider>
            {children}
            <Toast.Portal>
              <Toast.Viewport className="fixed z-[100000] top-auto right-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full flex w-[250px] sm:right-[2rem] sm:bottom-[2rem] sm:w-[300px]">
                <ToastList />
              </Toast.Viewport>
            </Toast.Portal>
          </Toast.Provider>
          <TanStackDevtools
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
