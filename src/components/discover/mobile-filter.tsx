import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface MobileFilterProps {
  label: string
  value: string | string[]
  options: { value: string; label: string }[]
  icon: React.ReactNode
  onChange: (value: string) => void
}

export default function MobileFilter({
  label,
  value,
  options,
  icon,
  onChange,
}: MobileFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options?.map((option) => {
          const isSelected =
            (Array.isArray(value) && value.includes(option.value)) ||
            (!Array.isArray(value) && value === option.value)
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
                'border border-border hover:border-primary/50',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background hover:bg-accent',
              )}
            >
              {isSelected && <Check className="h-3.5 w-3.5" />}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
