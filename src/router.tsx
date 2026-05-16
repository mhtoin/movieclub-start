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
    defaultPreloadStaleTime: 1000 * 60 * 5, // 5 min preload cache — React Query's staleTime still governs refetching
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
