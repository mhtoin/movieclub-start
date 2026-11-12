import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen.ts'
import { createQueryClient } from '@/lib/query-client'

export const getRouter = () => {
  const queryClient = createQueryClient()

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: { queryClient },
    defaultPreload: 'intent',
    // React Query owns data freshness; don't let the Router cache suppress a
    // loader that needs to kick off a fresh external-cache query.
    defaultPreloadStaleTime: 0,
    defaultViewTransition: true,
    defaultPendingMs: 500,
    defaultPendingMinMs: 200,
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
