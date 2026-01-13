import type { BackgroundOptionKey } from '@/components/background-options'
import {
  BackgroundPreview,
  getBackgroundOptions,
  useBackgroundMutation,
} from '@/lib/background-utils'
import { ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import {
  PopoverArrow,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from './ui/popover'

const backgrounds = getBackgroundOptions()

export function BackgroundSelector() {
  const [isOpen, setIsOpen] = useState(false)

  const mutation = useBackgroundMutation(() => {
    setIsOpen(false)
  })

  const handleBackgroundChange = (background: BackgroundOptionKey) => {
    mutation.mutate(background)
  }

  return (
    <PopoverRoot open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          aria-label="Select background style"
          variant="icon"
          suppressHydrationWarning
        >
          <ImageIcon size={24} />
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner side="bottom" align="end" sideOffset={8}>
          <PopoverPopup size="default">
            <PopoverArrow />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold mb-3">Background Style</h3>
              <div className="grid gap-2">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => handleBackgroundChange(bg.value)}
                    disabled={mutation.isPending}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <BackgroundPreview type={bg.value} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{bg.label}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {bg.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </PopoverRoot>
  )
}
