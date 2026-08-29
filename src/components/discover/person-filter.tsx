import { useQuery } from '@tanstack/react-query'
import { User } from 'lucide-react'
import { useState } from 'react'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import { getImageUrl } from '@/lib/tmdb-api'
import {
  ComboboxInput,
  ComboboxItem,
  ComboboxPopup,
  ComboboxRoot,
  ComboboxTrigger,
} from '@/components/ui/combobox'

interface PersonFilterProps {
  selectedPeople: ReadonlyArray<{ id: number; name: string }>
  onPeopleChange: (people: Array<{ id: number; name: string }>) => void
  chipContent?: React.ReactNode
}

/**
 * Chip-style filter that searches TMDB's `/search/person` endpoint and adds
 * the selected person(s) to the active `/discover` filter set.
 *
 * Each entry written to the URL is `<id>|<name>` so the active filter pill
 * can render without a second TMDB round-trip.
 */
export function PersonFilter({
  selectedPeople,
  onPeopleChange,
  chipContent,
}: PersonFilterProps) {
  const [searchValue, setSearchValue] = useState('')
  const trimmed = searchValue.trim()
  const { data } = useQuery({
    ...tmdbQueries.personSearch(trimmed),
  })
  const results = data?.results ?? []

  const handleSelect = (id: number, name: string) => {
    if (selectedPeople.some((p) => p.id === id)) return
    onPeopleChange([...selectedPeople, { id, name }])
    setSearchValue('')
  }

  return (
    <ComboboxRoot>
      <ComboboxTrigger className="outline-none">{chipContent}</ComboboxTrigger>
      <ComboboxPopup className="w-72">
        <div className="p-2">
          <ComboboxInput
            placeholder="Search directors, actors..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="max-h-72 overflow-y-auto">
          {trimmed.length < 2 ? (
            <div className="flex items-center gap-2 px-3 py-6 text-center text-xs text-muted-foreground">
              <User className="size-3.5" />
              Type at least 2 characters
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No people found
            </div>
          ) : (
            results.map((person) => {
              const profileUrl = person.profile_path
                ? getImageUrl(person.profile_path, 'w92')
                : null
              return (
                <ComboboxItem
                  key={person.id}
                  value={String(person.id)}
                  onClick={() => handleSelect(person.id, person.name)}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {profileUrl ? (
                      <img
                        src={profileUrl}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-muted shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {person.name}
                      </span>
                      {person.known_for_department && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {person.known_for_department}
                        </span>
                      )}
                    </div>
                  </div>
                </ComboboxItem>
              )
            })
          )}
        </div>
      </ComboboxPopup>
    </ComboboxRoot>
  )
}
