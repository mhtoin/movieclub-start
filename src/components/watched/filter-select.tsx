import { Route } from '@/routes/_authenticated/watched'
import {
  SelectItem,
  SelectPopup,
  SelectRoot,
  SelectTrigger,
} from '../ui/select'

export default function FilterSelect({
  options,
  onChange,
}: {
  options?: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  const { user } = Route.useSearch()

  return (
    <SelectRoot onValueChange={onChange} value={user || null}>
      <SelectTrigger
        placeholder="User"
        className={'w-fit whitespace-nowrap min-w-46'}
      />
      <SelectPopup className={'whitespace-nowrap min-w-46'} size={'lg'}>
        <SelectItem value={null}>All</SelectItem>
        {options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </SelectRoot>
  )
}
