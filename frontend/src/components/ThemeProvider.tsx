import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useThemeStore } from '../stores/themeStore'

type Theme = 'dark' | 'light' | 'ocean' | 'forest'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light', 'ocean', 'forest')
    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
