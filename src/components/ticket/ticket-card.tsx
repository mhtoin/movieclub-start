import type { ReactNode } from 'react'

interface TicketCardProps {
  children: ReactNode
  delay?: number
  participating?: boolean
  clickable?: boolean
  onClick?: () => void
  className?: string
}

export function TicketCard({
  children,
  delay = 0,
  participating = true,
  clickable = false,
  onClick,
  className = '',
}: TicketCardProps) {
  const interactive = clickable && participating

  return (
    <div
      className={`ticket-card relative rounded-lg border border-border/20 bg-card/60 shadow-sm overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        interactive
          ? 'hover:-translate-y-1 hover:shadow-lg hover:border-border/40 cursor-pointer'
          : ''
      } ${className}`}
      style={{ animationDelay: `${delay}s` }}
      onClick={interactive ? onClick : undefined}
    >
      {children}
    </div>
  )
}
