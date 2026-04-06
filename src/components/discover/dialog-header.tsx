import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DialogHeaderProps {
  backdropUrl: string | null
  movieTitle: string
  onClose: () => void
}

export function DialogHeader({
  backdropUrl,
  movieTitle,
  onClose,
}: DialogHeaderProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white/90 hover:bg-black/60 hover:text-white transition-all border border-white/10"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      {backdropUrl ? (
        <div className="relative h-44 w-full overflow-hidden flex-shrink-0">
          <img
            src={backdropUrl}
            alt={movieTitle}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dialog-background via-dialog-background/70 to-dialog-background/30" />
        </div>
      ) : (
        <div className="h-2 w-full shrink-0 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
      )}
    </>
  )
}
