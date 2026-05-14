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
        <EllipsisVertical className="size-4" />
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner side="bottom" align="center" sideOffset={8}>
          <PopoverPopup size={'auto'}>
            <PopoverArrow />
            <div className="flex flex-col gap-3">
              <label
                htmlFor="raffle-settings-dry-run"
                className="flex items-center justify-between w-full gap-2"
              >
                <span className="text-sm text-foreground">Dry Run</span>
                <Switch
                  id="raffle-settings-dry-run"
                  checked={dryRun}
                  onCheckedChange={onDryRunChange}
                />
              </label>
            </div>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </PopoverRoot>
  )
}
