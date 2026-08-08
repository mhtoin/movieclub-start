import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import type { SiteConfig } from '@/db/schema/siteconfig'
import { Button } from '@/components/ui/button'
import { ProviderFilter } from '@/components/discover/provider-filter'
import { adminQueries } from '@/lib/react-query/queries/admin'
import { useUpdateSiteConfig } from '@/lib/react-query/mutations/admin'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'

const weekdays = [
  ['monday', 'Monday'],
  ['tuesday', 'Tuesday'],
  ['wednesday', 'Wednesday'],
  ['thursday', 'Thursday'],
  ['friday', 'Friday'],
  ['saturday', 'Saturday'],
  ['sunday', 'Sunday'],
] as const
type WatchWeekDay = (typeof weekdays)[number][0]

function getConfiguredProviderIds(
  value: SiteConfig['watchProviders'],
): Array<string> {
  const configuredProviders = Array.isArray(value)
    ? value
    : value && Array.isArray(value.providers)
      ? value.providers
      : []

  return configuredProviders.flatMap((provider) => {
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

export function SiteConfigForm() {
  const { data: config } = useSuspenseQuery(adminQueries.siteConfig())
  const { data: providers } = useSuspenseQuery(tmdbQueries.watchProviders())
  const mutation = useUpdateSiteConfig()
  const [selectedProviders, setSelectedProviders] = useState(() =>
    getConfiguredProviderIds(config.watchProviders),
  )
  const [watchWeekDay, setWatchWeekDay] = useState<WatchWeekDay>(() => {
    const value = config.watchWeekDay.toLowerCase()
    return weekdays.some(([day]) => day === value)
      ? (value as WatchWeekDay)
      : 'saturday'
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate({
      watchWeekDay,
      watchProviders:
        selectedProviders.length > 0
          ? {
              providers: providers
                .filter((provider) =>
                  selectedProviders.includes(provider.provider_id.toString()),
                )
                .map((provider) => ({
                  provider_id: provider.provider_id,
                  provider_name: provider.provider_name,
                  logo_path: provider.logo_path,
                  display_priority:
                    (
                      provider.display_priorities as Record<
                        string,
                        number | undefined
                      >
                    ).FI ?? provider.display_priority,
                })),
            }
          : null,
    })
  }

  return (
    <section className="max-w-3xl">
      <header className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Site configuration
        </h2>
        <p className="mt-2 max-w-lg text-base leading-relaxed text-muted-foreground">
          Update the shared settings used by the movie club.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="watchWeekDay">
            Watch day
          </label>
          <select
            id="watchWeekDay"
            name="watchWeekDay"
            value={watchWeekDay}
            onChange={(event) =>
              setWatchWeekDay(event.target.value as WatchWeekDay)
            }
            required
            className="h-10 w-full rounded-md border border-border bg-background px-3.5 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-primary"
          >
            {weekdays.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border-2 border-primary/20 bg-primary/[0.04] p-4 shadow-sm shadow-primary/5 md:p-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              Streaming providers
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose which services appear across the club.
            </p>
          </div>
          <ProviderFilter
            selectedProviders={selectedProviders}
            onProvidersChange={setSelectedProviders}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Select the providers that should be included in the shared site
            configuration.
          </p>
        </div>

        <Button type="submit" variant="primary" loading={mutation.isPending}>
          <Save className="size-4" />
          Save configuration
        </Button>
      </form>
    </section>
  )
}
