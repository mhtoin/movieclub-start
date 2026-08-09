import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db/db'
import { siteConfig } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const DEFAULT_PROVIDER_IDS = ['8', '323', '496'] as const
export const DEFAULT_PROVIDER_FILTER = DEFAULT_PROVIDER_IDS.join('|')

export interface SiteConfigSettings {
  providerIds: Array<string>
  requireWinnerSelection: boolean
}

function getProviderIds(value: unknown): Array<string> {
  const providers = Array.isArray(value)
    ? value
    : typeof value === 'object' &&
        value !== null &&
        'providers' in value &&
        Array.isArray(value.providers)
      ? value.providers
      : []

  return providers.flatMap((provider) => {
    if (
      typeof provider === 'object' &&
      provider !== null &&
      'provider_id' in provider &&
      typeof provider.provider_id === 'number'
    ) {
      return [provider.provider_id.toString()]
    }
    return []
  })
}

export const getSiteConfigSettings = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((data: Record<string, never>) => data)
  .handler(async ({ context }) => {
    if (!context.user) throw new Error('Unauthorized')

    const row = await db
      .select({
        watchProviders: siteConfig.watchProviders,
        requireWinnerSelection: siteConfig.requireWinnerSelection,
      })
      .from(siteConfig)
      .limit(1)

    return {
      providerIds: getProviderIds(row[0]?.watchProviders),
      requireWinnerSelection: row[0]?.requireWinnerSelection ?? true,
    }
  })

export const siteConfigQueries = {
  settings: () =>
    queryOptions({
      queryKey: ['site-config', 'settings'],
      queryFn: () => getSiteConfigSettings({ data: {} }),
      staleTime: 1000 * 60 * 5,
    }),
  providerIds: () =>
    queryOptions({
      queryKey: ['site-config', 'provider-ids'],
      queryFn: async () =>
        (await getSiteConfigSettings({ data: {} })).providerIds,
      staleTime: 1000 * 60 * 5,
    }),
}
