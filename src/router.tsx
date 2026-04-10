import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { queryClient } from '@/lib/query-client'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen.ts'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0, // let React Query manage freshness via its own staleTime
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
