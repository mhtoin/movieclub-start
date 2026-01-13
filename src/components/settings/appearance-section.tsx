import type { BackgroundOptionKey } from '@/components/background-options'
import { useTheme } from '@/components/theme-provider'
import {
  BackgroundPreview,
  getBackgroundOptions,
  useBackgroundMutation,
} from '@/lib/background-utils'
import {
  COLOR_SCHEMES,
  setSchemeServerFn,
  type ColorScheme,
} from '@/lib/color-scheme'
import { Toast } from '@base-ui/react/toast'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Check, ImageIcon, Moon, Palette, Sun } from 'lucide-react'
import { useState } from 'react'

const schemes = Object.entries(COLOR_SCHEMES).map(([value, config]) => ({
  value: value as ColorScheme,
  label: config.label,
  colors: config.colors,
}))

const backgrounds = getBackgroundOptions()

interface AppearanceSectionProps {
  initialBackground?: BackgroundOptionKey
  initialColorScheme?: ColorScheme
}

export function AppearanceSection({
  initialBackground = 'none',
  initialColorScheme = 'default',
}: AppearanceSectionProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const toastManager = Toast.useToastManager()
  const [currentBackground, setCurrentBackground] =
    useState<BackgroundOptionKey>(initialBackground)
  const [currentColorScheme, setCurrentColorScheme] =
    useState<ColorScheme>(initialColorScheme)

  const schemeMutation = useMutation({
    mutationFn: async (scheme: ColorScheme) => {
      await setSchemeServerFn({ data: scheme })
      return scheme
    },
    onSuccess: (scheme) => {
      setCurrentColorScheme(scheme)
      if (document.startViewTransition) {
        const x = window.innerWidth / 2
        const y = window.innerHeight / 2
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
    },
    onError: (error) => {
      toastManager.add({
        title: 'Error',
        description: `Failed to update color scheme: ${error.message}`,
      })
    },
  })

  const backgroundMutation = useBackgroundMutation((background) => {
    setCurrentBackground(background)
  })

  function handleThemeChange(newTheme: 'light' | 'dark') {
    if (document.startViewTransition) {
      const x = window.innerWidth / 2
      const y = window.innerHeight / 2
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )

      const transition = document.startViewTransition(() => {
        setTheme(newTheme)
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
      setTheme(newTheme)
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sun className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Theme Mode</h3>
            <p className="text-sm text-muted-foreground">
              Choose between light and dark mode
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            className={`relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
              theme === 'light'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className="rounded-full bg-amber-100 p-3 shrink-0">
              <Sun className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-left flex-1">
              <span className="font-medium">Light</span>
              <p className="text-xs text-muted-foreground">Bright and clean</p>
            </div>
            {theme === 'light' && (
              <Check className="h-5 w-5 text-primary shrink-0" />
            )}
          </button>

          <button
            onClick={() => handleThemeChange('dark')}
            className={`relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className="rounded-full bg-slate-800 p-3 shrink-0">
              <Moon className="h-5 w-5 text-slate-300" />
            </div>
            <div className="text-left flex-1">
              <span className="font-medium">Dark</span>
              <p className="text-xs text-muted-foreground">Easy on the eyes</p>
            </div>
            {theme === 'dark' && (
              <Check className="h-5 w-5 text-primary shrink-0" />
            )}
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Color Scheme</h3>
            <p className="text-sm text-muted-foreground">
              Select your preferred accent colors
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {schemes.map((scheme) => {
            const isActive = currentColorScheme === scheme.value
            return (
              <button
                key={scheme.value}
                onClick={() => schemeMutation.mutate(scheme.value)}
                disabled={schemeMutation.isPending}
                className={`relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex gap-1.5 shrink-0">
                  <div
                    className="w-5 h-5 rounded-full shadow-sm ring-1 ring-black/10"
                    style={{ backgroundColor: scheme.colors.light }}
                  />
                  <div
                    className="w-5 h-5 rounded-full shadow-sm ring-1 ring-black/10"
                    style={{ backgroundColor: scheme.colors.dark }}
                  />
                </div>
                <span className="font-medium text-sm flex-1 text-left">
                  {scheme.label}
                </span>
                {isActive && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Background Style</h3>
            <p className="text-sm text-muted-foreground">
              Choose your preferred background effect
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {backgrounds.map((bg) => {
            const isActive = currentBackground === bg.value
            return (
              <button
                key={bg.value}
                onClick={() => backgroundMutation.mutate(bg.value)}
                disabled={backgroundMutation.isPending}
                className={`relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <BackgroundPreview type={bg.value} />
                <div className="text-left flex-1 min-w-0">
                  <span className="font-medium text-sm block truncate">
                    {bg.label}
                  </span>
                  <p className="text-xs text-muted-foreground truncate">
                    {bg.description}
                  </p>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
