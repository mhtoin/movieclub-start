import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface DashboardSectionProps {
  title: string
  icon?: LucideIcon
  description?: string
  children: ReactNode
  className?: string
}

export function DashboardSection({
  title,
  icon: Icon,
  description,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-5 md:p-6 shadow-sm flex flex-col',
        className,
      )}
    >
      <div className="flex items-center gap-2.5 mb-4">
        {Icon && (
          <div className="rounded-md bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold leading-tight">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  )
}
