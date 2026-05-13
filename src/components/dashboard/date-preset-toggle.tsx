import {
  Calendar,
  Clock,
  Infinity as InfinityIcon,
  Sparkles,
} from 'lucide-react'
import type { DatePreset } from '@/lib/react-query/queries/dashboard'
import { cn } from '@/lib/utils'

interface DatePresetToggleProps {
  value: DatePreset
  onChange: (v: DatePreset) => void
}

const presets: Array<{
  value: DatePreset
  label: string
  shortLabel: string
  icon: React.ElementType
}> = [
  {
    value: 'all-time',
    label: 'All Time',
    shortLabel: 'All',
    icon: InfinityIcon,
  },
  {
    value: 'current-year',
    label: 'This Year',
    shortLabel: 'Year',
    icon: Sparkles,
  },
  {
    value: 'last-90-days',
    label: '90 Days',
    shortLabel: '90d',
    icon: Calendar,
  },
  { value: 'last-30-days', label: '30 Days', shortLabel: '30d', icon: Clock },
]

export function DatePresetToggle({ value, onChange }: DatePresetToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-muted p-1 gap-0.5">
      {presets.map((preset) => {
        const Icon = preset.icon
        return (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all cursor-pointer',
              value === preset.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            title={preset.label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{preset.label}</span>
            <span className="sm:hidden">{preset.shortLabel}</span>
          </button>
        )
      })}
    </div>
  )
}
