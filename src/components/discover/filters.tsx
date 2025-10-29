import { GenreFilter } from './genre-filter'
import { ProviderFilter } from './provider-filter'
import { RatingFilter } from './rating-filter'
import { SortByFilter } from './sort-by-filter'

interface DiscoverFiltersProps {
  selectedGenres: string[]
  onGenresChange: (genres: string[]) => void
  selectedProviders: string[]
  onProvidersChange: (providers: string[]) => void
  voteRange: [number, number]
  onVoteRangeChange: (range: [number, number]) => void
  sortBy: string
  onSortByChange: (value: string) => void
}

export function DiscoverFilters({
  selectedGenres,
  onGenresChange,
  selectedProviders,
  onProvidersChange,
  voteRange,
  onVoteRangeChange,
  sortBy,
  onSortByChange,
}: DiscoverFiltersProps) {
  return (
    <div className="space-y-4">
      <SortByFilter value={sortBy} onValueChange={onSortByChange} />
      <GenreFilter
        selectedGenres={selectedGenres}
        onGenresChange={onGenresChange}
      />
      <ProviderFilter
        selectedProviders={selectedProviders}
        onProvidersChange={onProvidersChange}
      />
      <RatingFilter
        voteRange={voteRange}
        onVoteRangeChange={onVoteRangeChange}
      />
    </div>
  )
}
