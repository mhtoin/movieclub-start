import { useQuery } from '@tanstack/react-query'
import { CirclePlus, Loader2, Tag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { tmdbQueries } from '@/lib/react-query/queries/tmdb'
import {
  ComboboxInput,
  ComboboxItem,
  ComboboxPopup,
  ComboboxRoot,
  ComboboxTrigger,
} from '@/components/ui/combobox'

interface KeywordFilterProps {
  selectedKeywords: ReadonlyArray<{ id: number; name: string }>
  onKeywordsChange: (keywords: Array<{ id: number; name: string }>) => void
  chipContent?: React.ReactNode
}

const MIN_KEYWORD_LENGTH = 2

/**
 * Chip-style filter that searches TMDB's `/search/keyword` endpoint and adds
 * the selected keyword(s) to the active `/discover` filter set.
 *
 * Results are narrowed to keyword names that contain the normalized search
 * term (case-insensitive substring), so partial names match: typing
 * "christmas" also surfaces "Christmas Eve" / "Christmas Party".
 *
 * Each entry written to the URL is `<id>|<name>` so the active filter pill
 * can render without a second TMDB round-trip.
 */
export function KeywordFilter({
  selectedKeywords,
  onKeywordsChange,
  chipContent,
}: KeywordFilterProps) {
  const [searchValue, setSearchValue] = useState('')
  const normalizedTerm = searchValue.trim().toLowerCase()
  const isSearchEnabled = normalizedTerm.length >= MIN_KEYWORD_LENGTH
  const { data, isFetching, isError } = useQuery({
    ...tmdbQueries.keywordSearch(normalizedTerm),
  })

  const results = useMemo(() => {
    if (!isSearchEnabled || !data?.results) return []
    const seen = new Set<number>()
    return data.results.filter((keyword) => {
      if (seen.has(keyword.id)) return false
      seen.add(keyword.id)
      return keyword.name.toLowerCase().includes(normalizedTerm)
    })
  }, [data, isSearchEnabled, normalizedTerm])

  const handleSelect = (id: number, name: string) => {
    if (selectedKeywords.some((keyword) => keyword.id === id)) return
    onKeywordsChange([...selectedKeywords, { id, name }])
    setSearchValue('')
  }

  const handleSelectAll = () => {
    const selectedIds = new Set(selectedKeywords.map((keyword) => keyword.id))
    const newKeywords = results.filter(
      (keyword) => !selectedIds.has(keyword.id),
    )
    if (newKeywords.length > 0) {
      onKeywordsChange([...selectedKeywords, ...newKeywords])
    }
    setSearchValue('')
  }

  const showLoading = isSearchEnabled && isFetching && results.length === 0
  const showError = isSearchEnabled && isError && results.length === 0
  const showEmpty =
    isSearchEnabled && !isFetching && !isError && results.length === 0

  return (
    <ComboboxRoot>
      <ComboboxTrigger className="outline-none">{chipContent}</ComboboxTrigger>
      <ComboboxPopup className="w-80">
        <div className="p-2">
          <ComboboxInput
            placeholder="Search keywords..."
            aria-label="Search keywords"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full"
          />
          <p className="mt-1 px-0.5 text-[10px] leading-snug text-muted-foreground">
            Partial names match, e.g. &ldquo;christmas&rdquo; finds
            &ldquo;Christmas Eve&rdquo;.
          </p>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {!isSearchEnabled ? (
            <div className="flex items-center gap-2 px-3 py-6 text-center text-xs text-muted-foreground">
              <Tag className="size-3.5 shrink-0" />
              Type at least {MIN_KEYWORD_LENGTH} characters to search keywords
            </div>
          ) : showLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Searching keywords...
            </div>
          ) : showError ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Couldn&rsquo;t load keywords. Please try again.
            </div>
          ) : showEmpty ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No keywords found for &ldquo;{searchValue.trim()}&rdquo;
            </div>
          ) : (
            <>
              {results.length > 1 && (
                <ComboboxItem
                  value={`all-${normalizedTerm}`}
                  onClick={handleSelectAll}
                >
                  <CirclePlus className="size-3.5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Show movies with any of {results.length} matches
                  </span>
                </ComboboxItem>
              )}
              {results.map((keyword) => (
                <ComboboxItem
                  key={keyword.id}
                  value={String(keyword.id)}
                  onClick={() => handleSelect(keyword.id, keyword.name)}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <Tag className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-medium">
                      {keyword.name}
                    </span>
                  </div>
                </ComboboxItem>
              ))}
            </>
          )}
        </div>
      </ComboboxPopup>
    </ComboboxRoot>
  )
}
