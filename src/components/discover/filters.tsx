import {
  ArrowDownWideNarrow,
  Film,
  RotateCcw,
  SlidersHorizontal,
  Star,
  Tv,
} from 'lucide-react'
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
  const hasActiveFilters =
    selectedGenres.length > 0 ||
    selectedProviders.length > 0 ||
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
    <div className="w-full space-y-3">
      <div className="bg-sidebar/90 backdrop-blur-xl border border-sidebar-border/40 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center p-2 gap-1 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 border-r border-sidebar-border/30 mr-1">
            <SlidersHorizontal
              size={16}
              className="text-sidebar-foreground/60"
            />
            <span className="text-xs font-semibold text-sidebar-foreground/80 uppercase tracking-wider hidden sm:inline">
              Filters
            </span>
          </div>

          <div className="relative">
            <SortByFilter
              value={sortBy}
              onValueChange={onSortByChange}
              variant="chip"
              chipContent={
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    sortBy !== 'popularity.desc'
                      ? 'text-primary bg-primary/15'
                      : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <ArrowDownWideNarrow size={16} className="flex-shrink-0" />
                  <span className="text-xs font-medium whitespace-nowrap hidden lg:inline">
                    {currentSortLabel}
                  </span>
                  <span className="text-xs font-medium whitespace-nowrap lg:hidden">
                    Sort
                  </span>
                </div>
              }
            />
          </div>
          <div className="w-px h-6 bg-sidebar-border/30 mx-1" />
          <div className="relative">
            <GenreFilter
              selectedGenres={selectedGenres}
              onGenresChange={onGenresChange}
              variant="chip"
              chipContent={
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedGenres.length > 0
                      ? 'text-primary bg-primary/15'
                      : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <Film size={16} className="flex-shrink-0" />
                  <span className="text-xs font-medium whitespace-nowrap">
                    Genres
                  </span>
                  {selectedGenres.length > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full">
                      {selectedGenres.length}
                    </span>
                  )}
                </div>
              }
            />
          </div>
          <div className="relative">
            <ProviderFilter
              selectedProviders={selectedProviders}
              onProvidersChange={onProvidersChange}
              variant="chip"
              chipContent={
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedProviders.length > 0
                      ? 'text-primary bg-primary/15'
                      : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <Tv size={16} className="flex-shrink-0" />
                  <span className="text-xs font-medium whitespace-nowrap">
                    Streaming
                  </span>
                  {selectedProviders.length > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full">
                      {selectedProviders.length}
                    </span>
                  )}
                </div>
              }
            />
          </div>
          <div className="relative">
            <RatingFilter
              voteRange={voteRange}
              onVoteRangeChange={onVoteRangeChange}
              variant="chip"
              chipContent={
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    isRatingModified
                      ? 'text-primary bg-primary/15'
                      : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <Star size={16} className="flex-shrink-0" />
                  <span className="text-xs font-medium whitespace-nowrap">
                    {isRatingModified
                      ? `${voteRange[0].toFixed(0)}-${voteRange[1].toFixed(0)}`
                      : 'Rating'}
                  </span>
                </div>
              }
            />
          </div>
          {hasActiveFilters && (
            <>
              <div className="w-px h-6 bg-sidebar-border/30 mx-1" />
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <RotateCcw size={14} className="flex-shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap hidden sm:inline">
                  Reset
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
