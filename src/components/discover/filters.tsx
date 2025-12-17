import { useMediaQuery } from '@/lib/hooks'
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

const sortOptions = [
  { value: 'popularity.desc', label: 'Popularity (High to Low)' },
  { value: 'popularity.asc', label: 'Popularity (Low to High)' },
  { value: 'vote_average.desc', label: 'Rating (High to Low)' },
  { value: 'vote_average.asc', label: 'Rating (Low to High)' },
  { value: 'release_date.desc', label: 'Release Date (Newest)' },
  { value: 'release_date.asc', label: 'Release Date (Oldest)' },
  { value: 'title.asc', label: 'Title (A-Z)' },
  { value: 'title.desc', label: 'Title (Z-A)' },
]

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
  const isMobile = !useMediaQuery('(min-width: 768px)')

  return (
    <div className="space-y-4">
      <SortByFilter
        value={sortBy}
        onValueChange={onSortByChange}
        variant={isMobile ? 'mobile' : 'default'}
      />
      <GenreFilter
        selectedGenres={selectedGenres}
        onGenresChange={onGenresChange}
        variant={isMobile ? 'mobile' : 'default'}
      />
      <ProviderFilter
        selectedProviders={selectedProviders}
        onProvidersChange={onProvidersChange}
        variant={isMobile ? 'mobile' : 'default'}
      />
      <RatingFilter
        voteRange={voteRange}
        onVoteRangeChange={onVoteRangeChange}
      />
    </div>
  )
}
