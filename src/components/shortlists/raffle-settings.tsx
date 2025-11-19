import { EllipsisVertical } from 'lucide-react'
import {
  PopoverArrow,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from '../ui/popover'
import { Switch } from '../ui/switch'

export default function RaffleSettings({
  dryRun,
  onDryRunChange,
}: {
  dryRun: boolean
  onDryRunChange: (value: boolean) => void
}) {
  return (
    <PopoverRoot>
      <PopoverTrigger>
        <EllipsisVertical className="w-4 h-4" />
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner side="bottom" align="center" sideOffset={8}>
          <PopoverPopup size={'auto'}>
            <PopoverArrow />
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between w-full gap-2">
                <span className="text-sm text-foreground">Dry Run</span>
                <Switch checked={dryRun} onCheckedChange={onDryRunChange} />
              </label>
            </div>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </PopoverRoot>
  )
}
