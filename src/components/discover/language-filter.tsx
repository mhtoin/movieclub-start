import { useMemo, useState } from 'react'
import { ChevronDown, Languages, X } from 'lucide-react'
import MobileFilter from './mobile-filter'
import { COMMON_LANGUAGES } from '@/lib/tmdb-api'
import {
  ComboboxInput,
  ComboboxItem,
  ComboboxPopup,
  ComboboxRoot,
  ComboboxTrigger,
} from '@/components/ui/combobox'

interface LanguageFilterProps {
  selectedLanguages: Array<string>
  onLanguagesChange: (languages: Array<string>) => void
  variant?: 'default' | 'mobile' | 'chip'
  chipContent?: React.ReactNode
}

export function LanguageFilter({
  selectedLanguages,
  onLanguagesChange,
  variant = 'default',
  chipContent,
}: LanguageFilterProps) {
  const [searchValue, setSearchValue] = useState('')

  const languages = COMMON_LANGUAGES

  const filteredLanguages = useMemo(() => {
    if (!searchValue) return languages
    return languages.filter(
      (lang) =>
        lang.english_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        lang.name.toLowerCase().includes(searchValue.toLowerCase()),
    )
  }, [languages, searchValue])

  const handleToggle = (iso: string) => {
    if (selectedLanguages.includes(iso)) {
      onLanguagesChange(selectedLanguages.filter((id) => id !== iso))
    } else {
      onLanguagesChange([...selectedLanguages, iso])
    }
  }

  const selectedLabels = languages
    .filter((l) => selectedLanguages.includes(l.iso_639_1))
    .map((l) => l.english_name)
    .join(', ')

  if (variant === 'mobile') {
    return (
      <MobileFilter
        label="Original Language"
        value={selectedLanguages}
        options={languages.map((lang) => ({
          value: lang.iso_639_1,
          label: lang.english_name,
        }))}
        icon={<Languages className="h-4 w-4" />}
        onChange={(value) => handleToggle(value)}
      />
    )
  }

  if (variant === 'chip') {
    return (
      <ComboboxRoot
        value={selectedLanguages}
        onValueChange={(value) => onLanguagesChange(value)}
        multiple
      >
        <ComboboxTrigger className="outline-none">
          {chipContent}
        </ComboboxTrigger>
        <ComboboxPopup className="w-56">
          <div className="p-2">
            <ComboboxInput
              placeholder="Filter languages..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredLanguages.map((lang) => (
              <ComboboxItem
                key={lang.iso_639_1}
                value={lang.iso_639_1}
                onClick={() => handleToggle(lang.iso_639_1)}
              >
                <span className="text-sm">{lang.english_name}</span>
              </ComboboxItem>
            ))}
            {filteredLanguages.length === 0 && (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No languages found
              </div>
            )}
          </div>
        </ComboboxPopup>
      </ComboboxRoot>
    )
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        Original Language
      </label>
      <ComboboxRoot
        value={selectedLanguages}
        onValueChange={(value) => onLanguagesChange(value)}
        multiple
      >
        <ComboboxTrigger className="w-full">
          <span className="flex-1 truncate text-left">
            {selectedLabels || 'Select languages...'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </ComboboxTrigger>
        <ComboboxPopup className="w-[var(--anchor-width)]">
          <div className="p-2">
            <ComboboxInput
              placeholder="Search languages..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredLanguages.map((lang) => (
              <ComboboxItem
                key={lang.iso_639_1}
                value={lang.iso_639_1}
                onClick={() => handleToggle(lang.iso_639_1)}
              >
                <div className="flex flex-1 items-center justify-between">
                  <span>{lang.english_name}</span>
                </div>
              </ComboboxItem>
            ))}
            {filteredLanguages.length === 0 && (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No languages found
              </div>
            )}
          </div>
        </ComboboxPopup>
      </ComboboxRoot>
      {selectedLanguages.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedLanguages.map((iso) => {
            const lang = languages.find((l) => l.iso_639_1 === iso)
            return (
              <button
                key={iso}
                onClick={() => handleToggle(iso)}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                {lang?.english_name}
                <X className="h-3 w-3" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
