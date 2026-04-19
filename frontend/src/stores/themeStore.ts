import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'ocean' | 'forest'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      
      setTheme: (theme: Theme) => {
        set({ theme })
      },
      
      toggleTheme: () => {
        const themes: Theme[] = ['dark', 'light', 'ocean', 'forest']
        const currentIndex = themes.indexOf(get().theme)
        const nextTheme = themes[(currentIndex + 1) % themes.length]
        set({ theme: nextTheme })
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)
