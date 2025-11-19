import { EllipsisVertical } from 'lucide-react'
import {
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from '../ui/popover'

export default function RaffleSettings() {
  return (
    <PopoverRoot>
      <PopoverTrigger>
        <EllipsisVertical className="w-4 h-4" />
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner side="bottom" align="end" sideOffset={8}>
          <PopoverPopup className="w-48 p-4 bg-card border shadow-lg rounded-lg">
            <div className="flex flex-col gap-3">
              <button className="text-sm text-foreground hover:text-primary transition-colors text-left w-full">
                Edit Raffle
              </button>
              <button className="text-sm text-foreground hover:text-primary transition-colors text-left w-full">
                Delete Raffle
              </button>
            </div>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </PopoverRoot>
  )
}
