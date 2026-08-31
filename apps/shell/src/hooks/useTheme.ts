import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type Theme = 'dark' | 'light'

/**
 * Hook for managing active theme ('dark' | 'light') and syncing with document data-theme attribute.
 */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('allgames:theme', 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#f2f1ec')
    }
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  const setDirectTheme = (t: Theme) => setTheme(t)

  return { theme, toggle, setTheme: setDirectTheme } as const
}
