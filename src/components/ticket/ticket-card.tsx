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
      className={`ticket-card relative rounded overflow-hidden transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] bg-gradient-to-br from-[var(--ticket-bg-start)] to-[var(--ticket-bg-end)] ${
        interactive
          ? 'hover:-translate-y-1.5 hover:rotate-[-0.3deg] hover:shadow-[0_12px_24px_rgba(0,0,0,0.25),0_24px_48px_rgba(0,0,0,0.15)] cursor-pointer'
          : ''
      } ${className}`}
      style={{ animationDelay: `${delay}s` }}
      onClick={interactive ? onClick : undefined}
    >
      <div
        className="absolute top-0 bottom-0 left-[88px] w-px opacity-50"
        style={{
          background:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 10px, var(--ticket-perforation) 10px, var(--ticket-perforation) 14px)',
        }}
      />
      {children}
    </div>
  )
}
