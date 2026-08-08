import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db/db'
import { siteConfig } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'

export const DEFAULT_PROVIDER_IDS = ['8', '323', '496'] as const
export const DEFAULT_PROVIDER_FILTER = DEFAULT_PROVIDER_IDS.join('|')

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

export const getSiteConfigProviderIds = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((data: Record<string, never>) => data)
  .handler(async ({ context }) => {
    if (!context.user) throw new Error('Unauthorized')

    const row = await db
      .select({ watchProviders: siteConfig.watchProviders })
      .from(siteConfig)
      .limit(1)

    return getProviderIds(row[0]?.watchProviders)
  })

export const siteConfigQueries = {
  providerIds: () =>
    queryOptions({
      queryKey: ['site-config', 'provider-ids'],
      queryFn: () => getSiteConfigProviderIds({ data: {} }),
      staleTime: 1000 * 60 * 5,
    }),
}
