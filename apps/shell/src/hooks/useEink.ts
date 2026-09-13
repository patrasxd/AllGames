import { useTheme } from './useTheme'

/**
 * Hook to manage E-reader (E-ink) mode.
 * E-Ink is now modeled as part of the shared semantic theme state
 * so the menu, shell and game content stay synchronized without refresh.
 */
export function useEink() {
  const { theme, setTheme, isEink } = useTheme()

  const setIsEink = (nextValue: boolean) => {
    const baseTheme = theme === 'e-ink-dark' || theme === 'dark' ? 'dark' : 'light'

    if (nextValue) {
      setTheme(baseTheme === 'dark' ? 'e-ink-dark' : 'e-ink-light')
      return
    }

    setTheme(baseTheme)
  }

  const toggleEink = () => setIsEink(!isEink)

  return { isEink, toggleEink, setIsEink }
}
