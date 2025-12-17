import {
  SelectItem,
  SelectPopup,
  SelectRoot,
  SelectTrigger,
} from '@/components/ui/select'
import { ChartLine } from 'lucide-react'
import MobileFilter from './mobile-filter'

interface SortByFilterProps {
  value: string
  onValueChange: (value: string) => void
  variant?: 'default' | 'mobile'
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

export function SortByFilter({
  value,
  onValueChange,
  variant = 'default',
}: SortByFilterProps) {
  if (variant === 'mobile') {
    return (
      <MobileFilter
        label="Sort By"
        value={value}
        options={sortOptions}
        icon={<ChartLine className="h-4 w-4" />}
        onChange={onValueChange}
      />
    )
  }
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">Sort By</label>
      <SelectRoot
        onValueChange={(value) => {
          if (value !== null) {
            onValueChange(value)
          }
        }}
        value={value}
      >
        <SelectTrigger className="w-full" />
        <SelectPopup className="w-[var(--anchor-width)]">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </SelectRoot>
    </div>
  )
}
