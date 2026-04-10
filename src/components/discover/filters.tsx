import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ArrowDownWideNarrow, Film, RotateCcw, Star, Tv, X } from 'lucide-react'
import { GenreFilter } from './genre-filter'
import { ProviderFilter } from './provider-filter'
import { RatingFilter } from './rating-filter'
import { SortByFilter } from './sort-by-filter'

interface DiscoverFiltersProps {
  selectedGenres: Array<string>
  onGenresChange: (genres: Array<string>) => void
  selectedProviders: Array<string>
  onProvidersChange: (providers: Array<string>) => void
  voteRange: [number, number]
  onVoteRangeChange: (range: [number, number]) => void
  sortBy: string
  onSortByChange: (value: string) => void
  totalResults?: number | null
  isSearchActive?: boolean
}

const sortOptions = [
  { value: 'popularity.desc', label: 'Popularity' },
  { value: 'vote_average.desc', label: 'Rating (High to Low)' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'title.asc', label: 'Title (A–Z)' },
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
  totalResults,
  isSearchActive = false,
}: DiscoverFiltersProps) {
  const hasActiveFilters =
    selectedGenres.length > 0 ||
    (selectedProviders.length > 0 && !isSearchActive) ||
    voteRange[0] !== 0 ||
    voteRange[1] !== 10

  const clearAllFilters = () => {
    onGenresChange([])
    onProvidersChange([])
    onVoteRangeChange([0, 10])
    onSortByChange('popularity.desc')
  }

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || 'Sort'

  const isRatingModified = voteRange[0] !== 0 || voteRange[1] !== 10

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {!isSearchActive && (
          <div className="relative">
            <SortByFilter
              value={sortBy}
              onValueChange={onSortByChange}
              variant="chip"
              chipContent={
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 text-xs font-medium whitespace-nowrap ${
                    sortBy !== 'popularity.desc'
                      ? 'text-primary bg-primary/10 ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <ArrowDownWideNarrow size={14} className="flex-shrink-0" />
                  <span className="hidden lg:inline">{currentSortLabel}</span>
                  <span className="lg:hidden">Sort</span>
                </div>
              }
            />
          </div>
        )}

        <div className="relative">
          <GenreFilter
            selectedGenres={selectedGenres}
            onGenresChange={onGenresChange}
            variant="chip"
            chipContent={
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 text-xs font-medium whitespace-nowrap ${
                  selectedGenres.length > 0
                    ? 'text-primary bg-primary/10 ring-1 ring-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Film size={14} className="flex-shrink-0" />
                <span>
                  {selectedGenres.length > 0
                    ? `${selectedGenres.length} genre${selectedGenres.length > 1 ? 's' : ''}`
                    : 'Genres'}
                </span>
              </div>
            }
          />
        </div>

        {!isSearchActive && (
          <div className="relative">
            <ProviderFilter
              selectedProviders={selectedProviders}
              onProvidersChange={onProvidersChange}
              variant="chip"
              chipContent={
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 text-xs font-medium whitespace-nowrap ${
                    selectedProviders.length > 0
                      ? 'text-primary bg-primary/10 ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Tv size={14} className="flex-shrink-0" />
                  <span>
                    {selectedProviders.length > 0
                      ? `${selectedProviders.length} service${selectedProviders.length > 1 ? 's' : ''}`
                      : 'Streaming'}
                  </span>
                </div>
              }
            />
          </div>
        )}

        <div className="relative">
          <RatingFilter
            voteRange={voteRange}
            onVoteRangeChange={onVoteRangeChange}
            variant="chip"
            chipContent={
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 text-xs font-medium whitespace-nowrap ${
                  isRatingModified
                    ? 'text-primary bg-primary/10 ring-1 ring-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Star size={14} className="flex-shrink-0" />
                <span>
                  {isRatingModified
                    ? `${voteRange[0].toFixed(0)}–${voteRange[1].toFixed(0)}`
                    : 'Rating'}
                </span>
              </div>
            }
          />
        </div>

        {isSearchActive && (
          <span className="text-[11px] text-muted-foreground/50 leading-snug">
            Sorted by relevance
          </span>
        )}

        {hasActiveFilters && (
          <>
            <div className="h-4 w-px bg-border/40 shrink-0" />
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <RotateCcw size={12} className="flex-shrink-0" />
              Clear all
            </button>
          </>
        )}

        {totalResults !== null &&
          totalResults !== undefined &&
          !isSearchActive && (
            <div className="ml-auto text-xs text-muted-foreground/70 font-medium tabular-nums shrink-0">
              {totalResults.toLocaleString()} movies
            </div>
          )}
      </div>

      {hasActiveFilters && (
        <ActiveFilterPills
          selectedGenres={selectedGenres}
          onGenresChange={onGenresChange}
          selectedProviders={selectedProviders}
          onProvidersChange={onProvidersChange}
          voteRange={voteRange}
          onVoteRangeChange={onVoteRangeChange}
          isRatingModified={isRatingModified}
          isSearchActive={isSearchActive}
        />
      )}
    </div>
  )
}

function ActiveFilterPills({
  selectedGenres,
  onGenresChange,
  selectedProviders,
  onProvidersChange,
  voteRange,
  onVoteRangeChange,
  isRatingModified,
  isSearchActive,
}: {
  selectedGenres: Array<string>
  onGenresChange: (genres: Array<string>) => void
  selectedProviders: Array<string>
  onProvidersChange: (providers: Array<string>) => void
  voteRange: [number, number]
  onVoteRangeChange: (range: [number, number]) => void
  isRatingModified: boolean
  isSearchActive: boolean
}) {
  const { data: genres = [] } = useSuspenseQuery(tmdbQueries.genres())
  const { data: providers = [] } = useSuspenseQuery(
    tmdbQueries.watchProviders(),
  )

  const genreMap = new Map(genres.map((g) => [g.value, g.label]))
  const providerMap = new Map(
    providers.map((p) => [p.provider_id.toString(), p.provider_name]),
  )

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {selectedGenres.map((genreId) => (
        <FilterPill
          key={`genre-${genreId}`}
          label={genreMap.get(genreId) ?? genreId}
          onRemove={() =>
            onGenresChange(selectedGenres.filter((id) => id !== genreId))
          }
        />
      ))}
      {!isSearchActive &&
        selectedProviders.map((providerId) => (
          <FilterPill
            key={`provider-${providerId}`}
            label={providerMap.get(providerId) ?? providerId}
            onRemove={() =>
              onProvidersChange(
                selectedProviders.filter((id) => id !== providerId),
              )
            }
          />
        ))}
      {isRatingModified ? (
        <FilterPill
          label={`Rating ${voteRange[0].toFixed(0)}–${voteRange[1].toFixed(0)}`}
          onRemove={() => onVoteRangeChange([0, 10])}
        />
      ) : null}
    </div>
  )
}

function FilterPill({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors group"
    >
      <span className="max-w-[180px] truncate">{label}</span>
      <X
        size={12}
        className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
      />
    </button>
  )
}
