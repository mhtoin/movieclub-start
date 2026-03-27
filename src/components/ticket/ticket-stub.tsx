import { getStubClass } from './ticket-helpers'
import { TicketStamp } from './ticket-stamp'
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
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            width={44}
            height={44}
            className={`w-11 h-11 rounded-full border-2 border-[var(--ticket-stub-avatar-border)] ${
              !participating ? 'grayscale opacity-50' : ''
            }`}
            loading={colorIndex < 6 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <div
            className={`w-11 h-11 rounded-full border-2 border-[var(--ticket-stub-avatar-border)] flex items-center justify-center font-bold text-lg text-[var(--ticket-placeholder-fg)] bg-[var(--ticket-placeholder-bg)] ${
              !participating ? 'grayscale opacity-50' : ''
            }`}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <p
          className={`text-[11px] font-semibold text-center break-words leading-[1.3] mt-2 max-w-[60px] text-[var(--ticket-stub-name)] ${
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
