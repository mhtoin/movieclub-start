import {
  ComboboxInput,
  ComboboxItem,
  ComboboxPopup,
  ComboboxRoot,
} from '../ui/combobox'

export default function FilterCombobox({
  options,
  onChange,
  value,
  label,
}: {
  options?: { value: string; label: string }[]
  onChange: (value: string | null) => void
  value: string | null
  label?: string
}) {
  return (
    <ComboboxRoot
      key={value || 'all'}
      onValueChange={onChange}
      value={value || null}
    >
      <ComboboxInput placeholder={label} className={'w-46'} />
      <ComboboxPopup size={'lg'} className={'lg'}>
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
