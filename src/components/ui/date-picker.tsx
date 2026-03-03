import { cn } from '@/lib/utils'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { Button } from './button'
import {
  PopoverBackdrop,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from './popover'

const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function getCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

interface CalendarProps {
  selected?: Date
  onSelect: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  defaultMonth?: Date
}

function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  defaultMonth,
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(
    () => defaultMonth ?? selected ?? new Date(),
  )

  const days = getCalendarDays(month)

  const isDisabled = (day: Date) => {
    if (minDate && isBefore(startOfDay(day), startOfDay(minDate))) return true
    if (maxDate && isBefore(startOfDay(maxDate), startOfDay(day))) return true
    return false
  }

  const handlePrevMonth = () => setMonth((m) => subMonths(m, 1))
  const handleNextMonth = () => setMonth((m) => addMonths(m, 1))

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {format(month, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="flex items-center justify-center text-[10px] font-medium text-muted-foreground h-7"
          >
            {name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day) => {
          const outside = !isSameMonth(day, month)
          const disabled = isDisabled(day)
          const isSelected = selected ? isSameDay(day, selected) : false
          const todayDay = isToday(day)

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect(day)}
              className={cn(
                'flex items-center justify-center h-8 w-full rounded-md text-sm transition-colors',
                outside && 'text-muted-foreground/40',
                !outside && !disabled && 'hover:bg-accent',
                todayDay &&
                  !isSelected &&
                  'font-semibold text-primary ring-1 ring-inset ring-primary/40',
                isSelected &&
                  'bg-primary text-primary-foreground font-semibold hover:bg-primary/80',
                disabled &&
                  'text-muted-foreground/30 cursor-not-allowed pointer-events-none',
              )}
              aria-label={format(day, 'PPPP')}
              aria-pressed={isSelected}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  displayFormat?: string
  className?: string
  disabled?: boolean
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Pick a date',
      minDate,
      maxDate,
      displayFormat = 'PPP',
      className,
      disabled,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (date: Date) => {
      onChange?.(date)
      setOpen(false)
    }

    return (
      <PopoverRoot open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              ref={ref}
              variant="outline"
              className={cn(
                'w-full justify-start gap-2 font-normal',
                !value && 'text-muted-foreground',
                className,
              )}
              disabled={disabled}
            />
          }
        >
          <CalendarIcon className="w-4 h-4 shrink-0" />
          <span>{value ? format(value, displayFormat) : placeholder}</span>
        </PopoverTrigger>

        <PopoverPortal>
          <PopoverBackdrop opacity="none" />
          <PopoverPositioner side="bottom" align="start" sideOffset={6}>
            <PopoverPopup size="auto" className="p-3 w-72">
              <Calendar
                selected={value}
                onSelect={handleSelect}
                minDate={minDate}
                maxDate={maxDate}
                defaultMonth={value}
              />
            </PopoverPopup>
          </PopoverPositioner>
        </PopoverPortal>
      </PopoverRoot>
    )
  },
)
DatePicker.displayName = 'DatePicker'

export { Calendar, DatePicker }
