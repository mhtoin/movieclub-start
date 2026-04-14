import type { LucideIcon } from 'lucide-react'

interface CompactStatProps {
  label: string
  value: string | number
  icon: LucideIcon
}

export function CompactStat({ label, value, icon: Icon }: CompactStatProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-md bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    label: string
  }
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight truncate">
              {value}
            </h3>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.value > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}% {trend.label}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  )
}
