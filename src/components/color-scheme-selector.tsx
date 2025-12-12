import {
  COLOR_SCHEMES,
  setSchemeServerFn,
  type ColorScheme,
} from '@/lib/color-scheme'
import { Toast } from '@base-ui/react/toast'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Palette } from 'lucide-react'
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

const schemes = Object.entries(COLOR_SCHEMES).map(([value, config]) => ({
  value: value as ColorScheme,
  label: config.label,
  colors: config.colors,
}))

export function ColorSchemeSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const toastManager = Toast.useToastManager()

  const mutation = useMutation({
    mutationFn: async (scheme: ColorScheme) => {
      await setSchemeServerFn({ data: scheme })
    },
    onSuccess: () => {
      if (document.startViewTransition) {
        const x = window.innerWidth
        const y = 0
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        )

        const transition = document.startViewTransition(() => {
          router.invalidate()
        })

        transition.ready.then(() => {
          const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ]
          document.documentElement.animate(
            {
              clipPath,
            },
            {
              duration: 500,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            },
          )
        })
      } else {
        router.invalidate()
      }
      setIsOpen(false)
    },
    onError: (error) => {
      toastManager.add({
        title: 'Error',
        description: `Failed to update color scheme: ${error.message}`,
      })
    },
  })

  const handleSchemeChange = (scheme: ColorScheme) => {
    mutation.mutate(scheme)
  }

  return (
    <PopoverRoot open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          aria-label="Select color scheme"
          variant="icon"
          suppressHydrationWarning
        >
          <Palette size={24} />
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner side="bottom" align="end" sideOffset={8}>
          <PopoverPopup size="sm">
            <PopoverArrow />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold mb-3">Color Scheme</h3>
              {schemes.map((scheme) => (
                <button
                  key={scheme.value}
                  onClick={() => handleSchemeChange(scheme.value)}
                  disabled={mutation.isPending}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex gap-1">
                    <div
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: scheme.colors.light }}
                      aria-label={`${scheme.label} light preview`}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: scheme.colors.dark }}
                      aria-label={`${scheme.label} dark preview`}
                    />
                  </div>
                  <span className="text-sm">{scheme.label}</span>
                </button>
              ))}
            </div>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </PopoverRoot>
  )
}
