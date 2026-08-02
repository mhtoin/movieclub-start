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
      className={`ticket-card relative rounded-lg border border-border/20 bg-card/60 shadow-sm overflow-hidden transition-[border-color,opacity] duration-150 ease-out ${
        interactive
          ? 'fine-hover:hover:-translate-y-1 fine-hover:hover:shadow-lg hover:border-border/40 cursor-pointer'
          : ''
      } ${className}`}
      style={{ animationDelay: `${delay}s` }}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
