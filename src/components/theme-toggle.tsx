import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <button onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? <Moon /> : <Sun />}
    </button>
  )
}
