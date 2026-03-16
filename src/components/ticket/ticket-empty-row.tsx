import { Plus } from 'lucide-react'

export function TicketEmptyRow({ position }: { position: number }) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-md border border-dashed bg-[var(--ticket-empty-bg)] border-[var(--ticket-empty-border)]">
      <div className="w-10 h-14 flex items-center justify-center bg-[var(--ticket-movie-bg)] rounded-sm text-[var(--ticket-empty-icon)]">
        <Plus className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--ticket-title)] opacity-40">
          Available
        </p>
        <div className="flex items-center gap-2 text-[11px] text-[var(--ticket-meta)] opacity-40">
          <span>Slot {position}</span>
        </div>
      </div>
    </div>
  )
}
