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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 p-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Layers className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No tierlists yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {isOwner
          ? 'Create your first tierlist to start ranking your favorite movies.'
          : "This user hasn't created any tierlists yet."}
      </p>
      {isOwner && <CreateTierlistDialog userId={userId} />}
    </div>
  )
}
