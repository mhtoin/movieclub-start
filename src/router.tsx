import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { QueryClient } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen.ts'
// Create a new router instance
export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60, // 1 hour — keeps cache alive well past staleTime
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 1000 * 60 * 5, // match staleTime — don't re-run loaders on hover if cache is fresh
    defaultViewTransition: true,
    // Show a pending state after 500 ms (halved from the 1 s default) so that
    // cold navigations with blocking loaders get feedback faster.
    defaultPendingMs: 500,
    defaultPendingMinMs: 200, // keep visible long enough to avoid a flash
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
