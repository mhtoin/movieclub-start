import Input from '@/components/ui/input'
import { useDebouncedCallback } from '@/lib/hooks'
import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export const MIN_SEARCH_LENGTH = 2

interface DiscoverSearchInputProps {
  searchQuery: string
  onSearchChange: (search: string) => void
}

export function DiscoverSearchInput({
  searchQuery,
  onSearchChange,
}: DiscoverSearchInputProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedNavigate = useDebouncedCallback((value: string) => {
    const trimmed = value.trim()
    if (trimmed.length >= MIN_SEARCH_LENGTH) {
      onSearchChange(trimmed)
    } else {
      onSearchChange('')
    }
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)
    debouncedNavigate(value)
  }

  const handleClearSearch = () => {
    setLocalSearch('')
    onSearchChange('')
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()

        inputRef.current?.focus()
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', down)
    document.addEventListener('keyup', up)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
      <Input
        placeholder="Search movies..."
        value={localSearch}
        onChange={handleSearchChange}
        className="pl-9 pr-8 h-8 text-sm bg-muted/50 border-muted-foreground/10 focus-visible:bg-background"
        size="sm"
        ref={inputRef}
      />
      {localSearch && (
        <button
          onClick={handleClearSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted-foreground/10 text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

interface SearchBannerProps {
  query: string
  onClear: () => void
}

export function SearchBanner({ query, onClear }: SearchBannerProps) {
  return (
    <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/8 border border-primary/15">
      <Search className="h-3.5 w-3.5 text-primary/70 flex-shrink-0" />
      <span className="text-sm text-foreground/80">
        Showing results for{' '}
        <span className="font-medium text-foreground">
          &ldquo;{query}&rdquo;
        </span>
      </span>
      <button
        onClick={onClear}
        className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
