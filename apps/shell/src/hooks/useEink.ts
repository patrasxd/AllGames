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
    if (isEink) {
      document.documentElement.setAttribute('data-eink', 'true')
    } else {
      document.documentElement.removeAttribute('data-eink')
    }
  }, [isEink])

  const toggleEink = () => setIsEink(prev => !prev)

  return { isEink, toggleEink, setIsEink }
}
