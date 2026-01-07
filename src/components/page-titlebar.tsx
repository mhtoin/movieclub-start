import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function PageTitleBar({
  title,
  description,
  kicker,
  actions,
  className,
}: {
  title: string
  description?: string
  kicker?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('page-titlebar', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {kicker ? <p className="page-titlebar__kicker">{kicker}</p> : null}
          <h1 className="page-titlebar__title">{title}</h1>
          {description ? (
            <p className="page-titlebar__description">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0 pt-1">{actions}</div> : null}
      </div>
    </div>
  )
}
