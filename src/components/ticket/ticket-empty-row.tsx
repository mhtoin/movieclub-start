import { Plus } from 'lucide-react'

export function TicketEmptyRow({ position }: { position: number }) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-md border border-dashed bg-muted/30 border-border">
      <div className="w-10 h-14 flex items-center justify-center bg-muted rounded-sm text-muted-foreground">
        <Plus className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground opacity-40">
          Add a movie
        </p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground opacity-40">
          <span>Slot {position}</span>
        </div>
      </div>
    </div>
  )
}
