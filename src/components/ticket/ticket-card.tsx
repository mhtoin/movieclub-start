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
      className={`ticket-card relative rounded overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-gradient-to-br from-[var(--ticket-bg-start)] to-[var(--ticket-bg-end)] ${
        interactive
          ? 'hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] cursor-pointer'
          : ''
      } ${className}`}
      style={{ animationDelay: `${delay}s` }}
      onClick={interactive ? onClick : undefined}
    >
      {children}
    </div>
  )
}
