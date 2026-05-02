import { Plus } from 'lucide-react'

export function TicketEmptyRow({ position }: { position: number }) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-md border border-dashed border-border/20 bg-transparent">
      <div className="w-10 h-14 flex items-center justify-center bg-muted/30 rounded-sm text-muted-foreground/40">
        <Plus className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/30">
          <span>Slot {position}</span>
        </div>
      </div>
    </div>
  )
}
