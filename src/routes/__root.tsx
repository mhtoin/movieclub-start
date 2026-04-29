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
import { persister } from '@/lib/query-client'
import type { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Link } from '@tanstack/react-router'
import { Home, Search } from 'lucide-react'
import { Suspense, lazy } from 'react'
import appCss from '../styles.css?url'

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-xl font-semibold text-foreground">
            Page not found
          </p>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-4 py-2 border border-input bg-background text-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors"
          >
            <Search className="h-4 w-4" />
            Discover Movies
          </Link>
        </div>
      </div>
    </div>
  )
}

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
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: 'leffaseura' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'preconnect', href: 'https://image.tmdb.org' },
      { rel: 'preconnect', href: 'https://api.themoviedb.org' },
      { rel: 'dns-prefetch', href: 'https://image.tmdb.org' },
      { rel: 'dns-prefetch', href: 'https://api.themoviedb.org' },
      {
        rel: 'preload',
        href: appCss,
        as: 'style',
      },
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
  const { queryClient } = Route.useRouteContext()

  return (
    <html
      className={`${theme} scheme-${colorScheme}`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
        <meta
          name="description"
          content="Movie club for picking and tracking movies together"
        />
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
