import { useTheme } from '@/components/theme-provider'
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button onClick={toggleTheme} aria-label="Toggle theme" variant={'icon'}>
      {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
    </Button>
  )
}
