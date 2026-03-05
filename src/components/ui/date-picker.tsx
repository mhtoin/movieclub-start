import { cn } from '@/lib/utils'
import { endOfYear, format, startOfYear } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface DatePickerPreset {
  label: string
  getValue: () => Date
}

export const DATE_PICKER_PRESETS = {
  startOfYear: {
    label: 'Start of year',
    getValue: () => startOfYear(new Date()),
  } satisfies DatePickerPreset,
  endOfYear: {
    label: 'End of year',
    getValue: () => endOfYear(new Date()),
  } satisfies DatePickerPreset,
} as const

export interface DatePickerProps {
  /** Controlled selected date */
  value?: Date
  /** Called when the user selects a date */
  onChange?: (date: Date) => void
  /** Placeholder text shown when no date is selected */
  placeholder?: string
  /** date-fns format string used to display the selected date. Defaults to 'PPP' */
  displayFormat?: string
  /** The earliest selectable date */
  minDate?: Date
  /** The latest selectable date */
  maxDate?: Date
  /** Disables the entire picker */
  disabled?: boolean
  /** Additional class names for the trigger button */
  className?: string
  /** Caption layout for the calendar header */
  captionLayout?: 'label' | 'dropdown' | 'dropdown-years'
  /** Optional preset shortcuts shown in a sidebar next to the calendar */
  presets?: DatePickerPreset[]
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  displayFormat = 'PPP',
  minDate,
  maxDate,
  disabled = false,
  className,
  captionLayout = 'dropdown',
  presets,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const disabledMatcher = React.useMemo(() => {
    if (minDate && maxDate) return { before: minDate, after: maxDate }
    if (minDate) return { before: minDate }
    if (maxDate) return { after: maxDate }
    return undefined
  }, [minDate, maxDate])

  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      if (date) {
        onChange?.(date)
        setOpen(false)
      }
    },
    [onChange],
  )

  const handlePreset = React.useCallback(
    (preset: DatePickerPreset) => {
      const date = preset.getValue()
      onChange?.(date)
      setOpen(false)
    },
    [onChange],
  )

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            data-empty={!value}
            className={cn(
              'w-full min-w-0 justify-start text-left font-normal data-[empty=true]:text-muted-foreground overflow-hidden',
              className,
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        <span className="truncate">
          {value ? format(value, displayFormat) : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex">
          {presets && presets.length > 0 && (
            <div className="flex flex-col gap-1 border-r border-border p-3 min-w-[9rem]">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'justify-start text-left text-sm font-normal',
                    value &&
                      preset.getValue().toDateString() === value.toDateString()
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground',
                  )}
                  onClick={() => handlePreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={disabledMatcher}
            defaultMonth={value ?? minDate}
            captionLayout={captionLayout}
            autoFocus
          />
        </div>
      </PopoverContent>
    </PopoverRoot>
  )
}
