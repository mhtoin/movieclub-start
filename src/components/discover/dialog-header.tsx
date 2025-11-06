import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

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
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 text-white hover:bg-black/70"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>
      {backdropUrl && (
        <div className="relative h-64 w-full overflow-hidden flex-shrink-0">
          <img
            src={backdropUrl}
            alt={movieTitle}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dialog-background to-transparent" />
        </div>
      )}
    </>
  )
}
