import {
  getInteractableStampClass,
  getStaticStampClass,
  getStampText,
} from './ticket-helpers'

interface TicketStampProps {
  participating: boolean
  isReady: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function TicketStamp({
  participating,
  isReady,
  onClick,
}: TicketStampProps) {
  const interactive = !!onClick && participating
  const stampClass = interactive
    ? getInteractableStampClass(participating, isReady)
    : getStaticStampClass(participating, isReady)

  return (
    <div
      className={stampClass}
      style={{
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        transform: 'rotate(-8deg)',
        cursor: interactive ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {getStampText(participating, isReady)}
    </div>
  )
}
