import { Route } from '@/routes/_authenticated/watched'
import {
  ComboboxInput,
  ComboboxItem,
  ComboboxPopup,
  ComboboxRoot,
} from '../ui/combobox'

export default function FilterCombobox({
  options,
  onChange,
}: {
  options?: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  const { genre } = Route.useSearch()

  return (
    <ComboboxRoot
      key={genre || 'all'}
      onValueChange={onChange}
      value={genre || null}
    >
      <ComboboxInput placeholder="Genre" />
      <ComboboxPopup>
        <ComboboxItem value={null}>All</ComboboxItem>
        {options?.map((option) => (
          <ComboboxItem key={option.value} value={option.label}>
            {option.label}
          </ComboboxItem>
        ))}
      </ComboboxPopup>
    </ComboboxRoot>
  )
}
