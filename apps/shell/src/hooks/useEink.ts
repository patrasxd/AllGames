import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

const STORAGE_KEY = 'allgames:eink'

/**
 * Hook to manage E-reader (E-ink) mode.
 * Disables animations, forces ultra-crisp monochrome contrast,
 * and removes low-refresh-rate artifacts for e-ink displays.
 */
export function useEink() {
  const [isEink, setIsEink] = useLocalStorage<boolean>(STORAGE_KEY, false)

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('allgames:theme') || 'dark'
    if (isEink) {
      document.documentElement.setAttribute('data-eink', 'true')
      document.documentElement.setAttribute('data-theme', storedTheme === 'dark' ? 'e-ink-dark' : 'e-ink-light')
      document.documentElement.setAttribute('data-motion', 'none')
    } else {
      document.documentElement.removeAttribute('data-eink')
      document.documentElement.setAttribute('data-theme', storedTheme)
      document.documentElement.removeAttribute('data-motion')
    }
  }, [isEink])

  const toggleEink = () => setIsEink(prev => !prev)

  return { isEink, toggleEink, setIsEink }
}
