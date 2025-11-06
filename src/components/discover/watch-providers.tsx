import { getImageUrl } from '@/lib/tmdb-api'
import { WatchProviders } from '@/types/tmdb'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface WatchProvidersListProps {
  watchProviders: WatchProviders
  region?: string
}

export function WatchProvidersList({
  watchProviders,
  region = 'FI',
}: WatchProvidersListProps) {
  const [showAllProviders, setShowAllProviders] = useState(false)
  const providers = watchProviders.results?.[region]?.flatrate

  if (!providers || providers.length === 0) {
    return null
  }

  const watchProvidersLink = watchProviders.results?.[region]?.link

  return (
    <div>
      <h3 className="mb-2 font-semibold">Available On</h3>
      <div className="flex flex-wrap gap-2">
        {providers
          .slice(0, showAllProviders ? undefined : 2)
          .map((provider) => {
            const logoUrl = getImageUrl(provider.logo_path, 'w92')
            return (
              <a
                key={provider.provider_id}
                href={watchProvidersLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 hover:bg-secondary/70 transition-colors cursor-pointer"
                title={`Watch on ${provider.provider_name}`}
              >
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt={provider.provider_name}
                    className="h-6 w-6 rounded"
                  />
                )}
                <span className="text-sm font-medium">
                  {provider.provider_name}
                </span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )
          })}
        {providers.length > 2 && (
          <button
            onClick={() => setShowAllProviders(!showAllProviders)}
            className="flex items-center gap-1 rounded-lg bg-secondary/30 px-3 py-2 hover:bg-secondary/50 transition-colors text-sm font-medium"
          >
            <span>
              {showAllProviders ? 'Show less' : `+${providers.length - 2} more`}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showAllProviders ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
    </div>
  )
}
