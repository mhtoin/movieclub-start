import { Toast } from '@base-ui/react/toast'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import { ErrorComponent } from '@/components/error-component'
import { ThemeProvider } from '@/components/theme-provider'
import ToastList from '@/components/ui/toast-list'
import { getThemeAndSchemeServerFn } from '@/lib/color-scheme'
import { persister, queryClient } from '@/lib/query-client'
import type { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Suspense, lazy } from 'react'
import appCss from '../styles.css?url'

const Devtools = import.meta.env.DEV
  ? lazy(async () => {
      const [
        { TanStackDevtools },
        { TanStackRouterDevtoolsPanel },
        { ReactQueryDevtools },
      ] = await Promise.all([
        import('@tanstack/react-devtools'),
        import('@tanstack/react-router-devtools'),
        import('@tanstack/react-query-devtools'),
      ])
      function AllDevtools() {
        return (
          <>
            <TanStackDevtools
              plugins={[
                {
                  name: 'TanStack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </>
        )
      }
      return { default: AllDevtools }
    })
  : null

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  errorComponent: ErrorComponent,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'leffaseura' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'preconnect', href: 'https://image.tmdb.org' },
      { rel: 'dns-prefetch', href: 'https://image.tmdb.org' },
      { rel: 'preload', href: appCss, as: 'style' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  loader: async () => getThemeAndSchemeServerFn(),
  shellComponent: RootDocument,
})

function AppChildren({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toast.Provider>
        {children}
        <Toast.Portal>
          <Toast.Viewport className="fixed z-[100000] top-auto right-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full flex w-[250px] sm:right-[2rem] sm:bottom-[2rem] sm:w-[300px]">
            <ToastList />
          </Toast.Viewport>
        </Toast.Portal>
      </Toast.Provider>
      {import.meta.env.DEV && Devtools && (
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
      )}
    </>
  )
}

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
          {persister ? (
            <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{
                persister,
                maxAge: 1000 * 60 * 60 * 24 * 7,
              }}
            >
              <AppChildren>{children}</AppChildren>
            </PersistQueryClientProvider>
          ) : (
            <AppChildren>{children}</AppChildren>
          )}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
