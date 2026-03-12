import { Toast } from '@base-ui/react/toast'
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'

import { ErrorComponent } from '@/components/error-component'
import { ThemeProvider } from '@/components/theme-provider'
import ToastList from '@/components/ui/toast-list'
import { getThemeAndSchemeServerFn } from '@/lib/color-scheme'
import type { QueryClient } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import appCss from '../styles.css?url'

// Devtools are loaded lazily so they are never included in the production
// bundle. The import() calls are only evaluated when DEV is true.
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
                  name: 'Tanstack Router',
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
        rel: 'preconnect',
        href: 'https://image.tmdb.org',
      },
      {
        rel: 'dns-prefetch',
        href: 'https://image.tmdb.org',
      },
      {
        rel: 'preload',
        href: appCss,
        as: 'style',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  loader: async () => {
    return await getThemeAndSchemeServerFn()
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
          {import.meta.env.DEV && Devtools && (
            <Suspense fallback={null}>
              <Devtools />
            </Suspense>
          )}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
