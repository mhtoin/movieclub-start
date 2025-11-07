import {
  ComboboxInput,
  ComboboxItem,
  ComboboxPopup,
  ComboboxRoot,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ChevronDown, X } from 'lucide-react'
import { useMemo, useState } from 'react'

interface GenreFilterProps {
  selectedGenres: string[]
  onGenresChange: (genres: string[]) => void
}

export function GenreFilter({
  selectedGenres,
  onGenresChange,
}: GenreFilterProps) {
  const { data: genres = [] } = useSuspenseQuery(tmdbQueries.genres())
  const [searchValue, setSearchValue] = useState('')

  const filteredGenres = useMemo(() => {
    if (!searchValue) return genres
    return genres.filter((genre) =>
      genre.label.toLowerCase().includes(searchValue.toLowerCase()),
    )
  }, [genres, searchValue])

  const handleToggle = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      onGenresChange(selectedGenres.filter((id) => id !== genreId))
    } else {
      onGenresChange([...selectedGenres, genreId])
    }
  }

  const selectedLabels = genres
    .filter((g) => selectedGenres.includes(g.value))
    .map((g) => g.label)
    .join(', ')

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">Genre</label>
      <ComboboxRoot
        value={selectedGenres}
        onValueChange={(value) => onGenresChange(value)}
        multiple
      >
        <ComboboxTrigger className="w-full">
          <span className="flex-1 truncate text-left">
            {selectedLabels || 'Select genres...'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </ComboboxTrigger>
        <ComboboxPopup className="w-[var(--anchor-width)]">
          <div className="p-2">
            <ComboboxInput
              placeholder="Search genres..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredGenres.map((genre) => (
              <ComboboxItem
                key={genre.value}
                value={genre.value}
                onClick={() => handleToggle(genre.value)}
              >
                <div className="flex flex-1 items-center justify-between">
                  <span>{genre.label}</span>
                </div>
              </ComboboxItem>
            ))}
            {filteredGenres.length === 0 && (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No genres found
              </div>
            )}
          </div>
        </ComboboxPopup>
      </ComboboxRoot>
      {selectedGenres.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedGenres.map((genreId) => {
            const genre = genres.find((g) => g.value === genreId)
            return (
              <button
                key={genreId}
                onClick={() => handleToggle(genreId)}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                {genre?.label}
                <X className="h-3 w-3" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
