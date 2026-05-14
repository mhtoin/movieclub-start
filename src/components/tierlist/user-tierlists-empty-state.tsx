import confetti from 'canvas-confetti'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { Layers } from 'lucide-react'
import { CreateTierlistDialog } from './create-tierlist-dialog'

export function UserTierlistsEmptyState({
  isOwner,
  userId,
}: {
  isOwner: boolean
  userId: string
}) {
  const handleCreateClick = () => {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.55 },
      colors: ['#E8B931', '#C0392B', '#F39C12', '#27AE60'],
      disableForReducedMotion: true,
    })
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 min-h-[360px] py-16 px-8 text-center">
        <m.div
          className="size-14 rounded-2xl bg-muted flex items-center justify-center mb-5"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Layers className="size-7 text-muted-foreground/70" />
        </m.div>
        <h3 className="text-lg font-semibold mb-1.5">No tierlists yet</h3>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs">
          {isOwner
            ? 'Create your first tierlist to start ranking your favorite movies.'
            : "This user hasn't created any tierlists yet."}
        </p>
        {isOwner && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleCreateClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCreateClick()
              }
            }}
          >
            <CreateTierlistDialog userId={userId} />
          </div>
        )}
      </div>
    </LazyMotion>
  )
}
