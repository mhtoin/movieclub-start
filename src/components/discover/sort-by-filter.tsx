import { ChartLine } from 'lucide-react'
import MobileFilter from './mobile-filter'
import {
  SelectItem,
  SelectPopup,
  SelectRoot,
  SelectTrigger,
} from '@/components/ui/select'

interface SortByFilterProps {
  value: string
  onValueChange: (value: string) => void
  variant?: 'default' | 'mobile' | 'chip'
  chipContent?: React.ReactNode
}

const sortOptions = [
  { value: 'popularity.desc', label: 'Popularity' },
  { value: 'vote_average.desc', label: 'Rating (High to Low)' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'title.asc', label: 'Title (A\u2013Z)' },
]

export function SortByFilter({
  value,
  onValueChange,
  variant = 'default',
  chipContent,
}: SortByFilterProps) {
  if (variant === 'chip') {
    return (
      <SelectRoot
        onValueChange={(value) => {
          if (value !== null) {
            onValueChange(value)
          }
        }}
        value={value}
      >
        <SelectTrigger className="border-none bg-transparent p-0 h-auto hover:bg-transparent focus:outline-none data-[popup-open]:outline-none">
          {chipContent}
        </SelectTrigger>
        <SelectPopup className="w-56">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </SelectRoot>
    )
  }

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
