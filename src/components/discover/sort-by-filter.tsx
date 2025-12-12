import {
  SelectItem,
  SelectPopup,
  SelectRoot,
  SelectTrigger,
} from '@/components/ui/select'

interface SortByFilterProps {
  value: string
  onValueChange: (value: string) => void
}

export function SortByFilter({ value, onValueChange }: SortByFilterProps) {
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
          <SelectItem value="popularity.desc">
            Popularity (High to Low)
          </SelectItem>
          <SelectItem value="popularity.asc">
            Popularity (Low to High)
          </SelectItem>
          <SelectItem value="vote_average.desc">
            Rating (High to Low)
          </SelectItem>
          <SelectItem value="vote_average.asc">Rating (Low to High)</SelectItem>
          <SelectItem value="release_date.desc">
            Release Date (Newest)
          </SelectItem>
          <SelectItem value="release_date.asc">
            Release Date (Oldest)
          </SelectItem>
          <SelectItem value="title.asc">Title (A-Z)</SelectItem>
          <SelectItem value="title.desc">Title (Z-A)</SelectItem>
        </SelectPopup>
      </SelectRoot>
    </div>
  )
}
