import { Toast } from '@base-ui/react/toast'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Check, ImageIcon, Moon, Palette, Sun } from 'lucide-react'
import { useState } from 'react'
import type { BackgroundOptionKey } from '@/components/background-options'
import type { ColorScheme } from '@/lib/color-scheme'
import { useTheme } from '@/components/theme-provider'
import {
  BackgroundPreview,
  getBackgroundOptions,
  useBackgroundMutation,
} from '@/lib/background-utils'
import { COLOR_SCHEMES, setSchemeServerFn } from '@/lib/color-scheme'

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
        type: 'error',
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
    <div className="space-y-10">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sun className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Theme</h3>
            <p className="text-sm text-muted-foreground">
              Choose your preferred appearance
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
              theme === 'light'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="rounded-full bg-amber-100 p-2.5">
              <Sun className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-left">
              <span className="font-medium block">Light</span>
              <span className="text-xs text-muted-foreground">
                Bright and clean
              </span>
            </div>
            {theme === 'light' && (
              <Check className="h-5 w-5 text-primary ml-auto" />
            )}
          </button>

          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="rounded-full bg-slate-800 p-2.5">
              <Moon className="h-5 w-5 text-slate-300" />
            </div>
            <div className="text-left">
              <span className="font-medium block">Dark</span>
              <span className="text-xs text-muted-foreground">
                Easy on the eyes
              </span>
            </div>
            {theme === 'dark' && (
              <Check className="h-5 w-5 text-primary ml-auto" />
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
              Pick an accent color palette
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {schemes.map((scheme) => {
            const isActive = currentColorScheme === scheme.value
            return (
              <button
                key={scheme.value}
                onClick={() => schemeMutation.mutate(scheme.value)}
                disabled={schemeMutation.isPending}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded-full shadow-sm ring-1 ring-black/10"
                    style={{ backgroundColor: scheme.colors.light }}
                  />
                  <div
                    className="w-6 h-6 rounded-full shadow-sm ring-1 ring-black/10 -ml-2"
                    style={{ backgroundColor: scheme.colors.dark }}
                  />
                </div>
                <span className="font-medium text-sm">{scheme.label}</span>
                {isActive && <Check className="h-4 w-4 text-primary ml-1" />}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Background Effect</h3>
            <p className="text-sm text-muted-foreground">
              Optional visual effects for the app background
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
                className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="h-12 w-full rounded-md overflow-hidden bg-muted/50">
                  <BackgroundPreview type={bg.value} />
                </div>
                <span className="font-medium text-sm">{bg.label}</span>
                {isActive && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
