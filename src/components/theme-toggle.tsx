import { useTheme } from '@/components/theme-provider'
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function toggleTheme(event: React.MouseEvent<HTMLButtonElement>) {
    const newTheme = theme === 'light' ? 'dark' : 'light'

    if (document.startViewTransition) {
      const x = window.innerWidth
      const y = 0
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
    <Button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      variant={'icon'}
      suppressHydrationWarning
    >
      {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
    </Button>
  )
}
