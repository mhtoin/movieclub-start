import { Layers } from 'lucide-react'
import { CreateTierlistDialog } from './create-tierlist-dialog'

export function UserTierlistsEmptyState({
  isOwner,
  userId,
}: {
  isOwner: boolean
  userId: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 min-h-[360px] py-16 px-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
        <Layers className="w-7 h-7 text-muted-foreground/70" />
      </div>
      <h3 className="text-lg font-semibold mb-1.5">No tierlists yet</h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        {isOwner
          ? 'Create your first tierlist to start ranking your favorite movies.'
          : "This user hasn't created any tierlists yet."}
      </p>
      {isOwner && <CreateTierlistDialog userId={userId} />}
    </div>
  )
}
