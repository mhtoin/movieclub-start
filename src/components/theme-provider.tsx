import type { Theme } from '@/lib/theme'
import { setThemeServerFn } from '@/lib/theme'
import { useRouter } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'
import { createContext, useContext } from 'react'

type ThemeContextVal = { theme: Theme; setTheme: (val: Theme) => void }
type Props = PropsWithChildren<{ theme: Theme }>

const ThemeContext = createContext<ThemeContextVal | null>(null)

export function ThemeProvider({ children, theme }: Props) {
  const router = useRouter()

  function setTheme(val: Theme) {
    setThemeServerFn({ data: val }).then(() => router.invalidate())
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const val = useContext(ThemeContext)
  if (!val) {
    // During SSR, return a default value instead of throwing
    if (typeof window === 'undefined') {
      return {
        theme: 'dark' as Theme,
        setTheme: () => {},
      }
    }
    throw new Error('useTheme called outside of ThemeProvider!')
  }
  return val
}
