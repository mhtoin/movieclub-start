import { getStubClass } from './ticket-helpers'
import { TicketStamp } from './ticket-stamp'
import Avatar from '@/components/ui/avatar'
import type { ShortlistWithUserMovies } from '@/db/schema'

interface TicketStubProps {
  shortlist: ShortlistWithUserMovies
  colorIndex: number
  onStampClick?: (e: React.MouseEvent) => void
}

export function TicketStub({
  shortlist,
  colorIndex,
  onStampClick,
}: TicketStubProps) {
  const { user, isReady, participating } = shortlist

  return (
    <div className={getStubClass(participating, isReady)}>
      <div className="flex flex-col items-center pt-4">
        <Avatar
          src={user.image ?? ''}
          alt={user.name}
          name={user.name}
          size={44}
          className={`border-2 border-ring ${
            !participating ? 'grayscale opacity-50' : ''
          }`}
          loading={colorIndex < 6 ? 'eager' : 'lazy'}
          decoding="async"
        />
        <p
          className={`text-[11px] font-semibold text-center break-words leading-[1.3] mt-2 max-w-[60px] text-foreground ${
            !participating ? 'line-through opacity-50' : ''
          }`}
        >
          {user.name}
        </p>
      </div>
      <div className="flex flex-col items-center pb-4">
        <TicketStamp
          participating={participating}
          isReady={isReady}
          onClick={onStampClick}
        />
      </div>
    </div>
  )
}
