import {
  ComboboxInput,
  ComboboxItem,
  ComboboxPopup,
  ComboboxRoot,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { WatchProvider } from '@/lib/tmdb-api'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Check, ChevronDown, X } from 'lucide-react'
import { useMemo, useState } from 'react'

interface ProviderFilterProps {
  selectedProviders: string[]
  onProvidersChange: (providers: string[]) => void
}

export function ProviderFilter({
  selectedProviders,
  onProvidersChange,
}: ProviderFilterProps) {
  const { data: providers = [] } = useSuspenseQuery(
    tmdbQueries.watchProviders(),
  )
  const [searchValue, setSearchValue] = useState('')

  const filteredProviders = useMemo(() => {
    if (!searchValue) return providers
    return providers.filter((provider: WatchProvider) =>
      provider.provider_name.toLowerCase().includes(searchValue.toLowerCase()),
    )
  }, [providers, searchValue])

  const handleToggle = (providerId: string) => {
    if (selectedProviders.includes(providerId)) {
      onProvidersChange(selectedProviders.filter((id) => id !== providerId))
    } else {
      onProvidersChange([...selectedProviders, providerId])
    }
  }

  const selectedLabels = providers
    .filter((p: WatchProvider) =>
      selectedProviders.includes(p.provider_id.toString()),
    )
    .map((p: WatchProvider) => p.provider_name)
    .join(', ')

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        Streaming Providers
      </label>
      <ComboboxRoot
        value={selectedProviders}
        onValueChange={(value) => onProvidersChange(value)}
        multiple
      >
        <ComboboxTrigger className="w-full">
          <span className="flex-1 truncate text-left">
            {selectedLabels || 'Select providers...'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </ComboboxTrigger>
        <ComboboxPopup className="w-[var(--anchor-width)]">
          <div className="p-2">
            <ComboboxInput
              placeholder="Search providers..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredProviders.map((provider: WatchProvider) => (
              <ComboboxItem
                key={provider.provider_id}
                value={provider.provider_id.toString()}
                onClick={() => handleToggle(provider.provider_id.toString())}
              >
                <div className="flex flex-1 items-center justify-between">
                  <span>{provider.provider_name}</span>
                  {selectedProviders.includes(
                    provider.provider_id.toString(),
                  ) && <Check className="h-4 w-4" />}
                </div>
              </ComboboxItem>
            ))}
            {filteredProviders.length === 0 && (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No providers found
              </div>
            )}
          </div>
        </ComboboxPopup>
      </ComboboxRoot>
      {selectedProviders.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedProviders.map((providerId) => {
            const provider = providers.find(
              (p: WatchProvider) => p.provider_id.toString() === providerId,
            )
            return (
              <button
                key={providerId}
                onClick={() => handleToggle(providerId)}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                {provider?.provider_name}
                <X className="h-3 w-3" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
