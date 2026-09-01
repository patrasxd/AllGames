import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

export type Theme = 'dark' | 'light'

const THEME_KEY = 'allgames:theme'

function readThemeFromStorage(): Theme {
  try {
    const item = window.localStorage.getItem(THEME_KEY)
    if (item === 'light' || item === 'dark') return item
  } catch { /* ignore */ }
  return 'dark'
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readThemeFromStorage)

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    try { window.localStorage.setItem(THEME_KEY, t) } catch { /* ignore */ }
  }, [])

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  // Sync data-theme attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#f2f1ec')
    }
  }, [theme])

  // Sync across other browser tabs via StorageEvent
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
        setThemeState(e.newValue)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
