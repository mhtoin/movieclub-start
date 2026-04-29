import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { createQueryClient } from '@/lib/query-client'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen.ts'

// Create a new router instance
export const getRouter = () => {
  const queryClient = createQueryClient()

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0, // let React Query manage freshness via its own staleTime
    defaultViewTransition: true,
    defaultPendingMs: 500,
    defaultPendingMinMs: 200,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  // Clear the QueryClient after each SSR render so the next request
  // starts with a fresh cache and no data leaks between users.
  const ogDehydrate = router.options.dehydrate
  router.options.dehydrate = async () => {
    const result = await ogDehydrate?.()
    queryClient.clear()
    return result
  }

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
